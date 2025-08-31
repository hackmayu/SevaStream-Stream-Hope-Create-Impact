"""
News Verification Service
Uses NewsAPI, Google Fact Check API, and RAG with OpenAI to verify aid requests against real news
"""

import os
import json
import asyncio
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass

# News APIs
import requests
from newsapi import NewsApiClient
import feedparser
from bs4 import BeautifulSoup

# AI Libraries
import openai
from sentence_transformers import SentenceTransformer
import numpy as np

# Utilities
import re
import httpx
from urllib.parse import quote_plus

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class NewsVerification:
    """Result of news verification process"""
    verification_status: str  # "verified", "partially_verified", "unverified", "contradicted"
    confidence_score: float
    supporting_articles: List[Dict[str, Any]]
    contradicting_articles: List[Dict[str, Any]]
    fact_check_results: List[Dict[str, Any]]
    ai_summary: str
    verification_details: Dict[str, Any]
    last_updated: datetime

@dataclass
class NewsArticle:
    """Structured representation of a news article"""
    title: str
    url: str
    source: str
    published_at: datetime
    description: str
    content: Optional[str]
    relevance_score: float
    credibility_score: float

class NewsVerificationAI:
    """
    Main class for AI-powered news verification and fact-checking
    """
    
    def __init__(self):
        self.news_api = None
        self.openai_client = None
        self.sentence_model = None
        self.fact_check_sources = [
            "factcheck.org",
            "snopes.com", 
            "politifact.com",
            "reuters.com/fact-check",
            "afp.com/en/news/3262/afp-factcheck"
        ]
        self._initialize_services()
    
    def _initialize_services(self):
        """Initialize news APIs and AI models"""
        try:
            # Initialize NewsAPI
            news_api_key = os.getenv("NEWS_API_KEY")
            if news_api_key:
                self.news_api = NewsApiClient(api_key=news_api_key)
                logger.info("✅ NewsAPI initialized")
            else:
                logger.warning("⚠️ NEWS_API_KEY not found")
            
            # Initialize OpenAI
            openai_api_key = os.getenv("OPENAI_API_KEY")
            if openai_api_key:
                self.openai_client = openai.OpenAI(api_key=openai_api_key)
                logger.info("✅ OpenAI for RAG initialized")
            
            # Initialize sentence transformer for semantic matching
            try:
                self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
                logger.info("✅ Sentence transformer initialized")
            except Exception as e:
                logger.warning(f"⚠️ Sentence transformer failed: {e}")
                
        except Exception as e:
            logger.error(f"❌ Service initialization failed: {e}")
    
    async def verify_aid_request(
        self, 
        claim_text: str, 
        location: str, 
        incident_type: str,
        time_window_days: int = 30
    ) -> NewsVerification:
        """
        Main method to verify an aid request against news sources
        
        Args:
            claim_text: The aid request or claim to verify
            location: Geographic location mentioned
            incident_type: Type of incident (flood, earthquake, medical emergency, etc.)
            time_window_days: How far back to search for news
            
        Returns:
            NewsVerification object with detailed results
        """
        try:
            logger.info(f"🔍 Verifying claim: {claim_text[:100]}...")
            
            # Step 1: Search for relevant news articles
            news_articles = await self._search_relevant_news(
                claim_text, location, incident_type, time_window_days
            )
            
            # Step 2: Perform fact-checking searches
            fact_check_results = await self._search_fact_checks(claim_text, location)
            
            # Step 3: Use AI to analyze and summarize findings
            verification_result = await self._analyze_with_ai(
                claim_text, news_articles, fact_check_results
            )
            
            # Step 4: Calculate final verification status
            final_verification = self._calculate_verification_status(
                verification_result, news_articles, fact_check_results
            )
            
            logger.info(f"✅ Verification complete: {final_verification.verification_status}")
            return final_verification
            
        except Exception as e:
            logger.error(f"❌ Verification failed: {e}")
            return NewsVerification(
                verification_status="error",
                confidence_score=0.0,
                supporting_articles=[],
                contradicting_articles=[],
                fact_check_results=[],
                ai_summary=f"Verification failed due to error: {str(e)}",
                verification_details={"error": str(e)},
                last_updated=datetime.now()
            )
    
    async def _search_relevant_news(
        self, 
        claim_text: str, 
        location: str, 
        incident_type: str, 
        time_window_days: int
    ) -> List[NewsArticle]:
        """Search for relevant news articles using multiple sources"""
        articles = []
        
        # Generate search queries
        search_queries = self._generate_search_queries(claim_text, location, incident_type)
        
        # Search using NewsAPI
        if self.news_api:
            for query in search_queries[:3]:  # Limit to 3 queries to avoid rate limits
                try:
                    news_articles = await self._search_newsapi(query, time_window_days)
                    articles.extend(news_articles)
                except Exception as e:
                    logger.warning(f"NewsAPI search failed for '{query}': {e}")
        
        # Search using RSS feeds and public APIs
        rss_articles = await self._search_rss_feeds(search_queries, location)
        articles.extend(rss_articles)
        
        # Remove duplicates and rank by relevance
        unique_articles = self._deduplicate_articles(articles)
        ranked_articles = await self._rank_articles_by_relevance(unique_articles, claim_text)
        
        return ranked_articles[:20]  # Return top 20 most relevant articles
    
    def _generate_search_queries(self, claim_text: str, location: str, incident_type: str) -> List[str]:
        """Generate targeted search queries for news verification"""
        queries = []
        
        # Basic location + incident queries
        if location and incident_type:
            queries.extend([
                f'"{location}" {incident_type}',
                f'{location} {incident_type} aid relief',
                f'{location} disaster emergency {incident_type}'
            ])
        
        # Extract key phrases from claim text
        key_phrases = self._extract_key_phrases(claim_text)
        for phrase in key_phrases[:3]:
            if location:
                queries.append(f'"{phrase}" {location}')
            else:
                queries.append(f'"{phrase}"')
        
        # Add incident-specific queries
        incident_keywords = {
            "flood": ["flooding", "inundated", "water damage", "evacuation"],
            "earthquake": ["seismic", "tremor", "structural damage", "casualties"],
            "medical": ["health crisis", "medical emergency", "hospital", "treatment"],
            "drought": ["water shortage", "crop failure", "famine", "irrigation"],
            "fire": ["wildfire", "blaze", "evacuation", "burn damage"]
        }
        
        if incident_type.lower() in incident_keywords:
            for keyword in incident_keywords[incident_type.lower()][:2]:
                if location:
                    queries.append(f'{location} {keyword}')
        
        return list(set(queries))  # Remove duplicates
    
    def _extract_key_phrases(self, text: str) -> List[str]:
        """Extract key phrases from claim text"""
        # Simple keyword extraction (can be enhanced with NLP)
        phrases = []
        
        # Look for quoted phrases
        quoted_phrases = re.findall(r'"([^"]+)"', text)
        phrases.extend(quoted_phrases)
        
        # Look for important noun phrases (basic pattern)
        important_patterns = [
            r'\b(?:village|city|town|district|hospital|school|community)\s+[A-Z][a-z]+\b',
            r'\b\d+\s+(?:people|families|children|victims)\b',
            r'\b(?:emergency|crisis|disaster|urgent)\s+\w+\b'
        ]
        
        for pattern in important_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            phrases.extend(matches)
        
        return phrases[:10]  # Limit to 10 phrases
    
    async def _search_newsapi(self, query: str, time_window_days: int) -> List[NewsArticle]:
        """Search NewsAPI for relevant articles"""
        try:
            # Calculate date range
            to_date = datetime.now()
            from_date = to_date - timedelta(days=time_window_days)
            
            # Search everything endpoint
            response = self.news_api.get_everything(
                q=query,
                from_param=from_date.strftime('%Y-%m-%d'),
                to=to_date.strftime('%Y-%m-%d'),
                language='en',
                sort_by='relevancy',
                page_size=20
            )
            
            articles = []
            if response['status'] == 'ok':
                for article_data in response['articles']:
                    try:
                        article = NewsArticle(
                            title=article_data['title'] or '',
                            url=article_data['url'] or '',
                            source=article_data['source']['name'] or '',
                            published_at=datetime.fromisoformat(
                                article_data['publishedAt'].replace('Z', '+00:00')
                            ) if article_data['publishedAt'] else datetime.now(),
                            description=article_data['description'] or '',
                            content=article_data['content'],
                            relevance_score=0.0,  # Will be calculated later
                            credibility_score=self._calculate_source_credibility(
                                article_data['source']['name']
                            )
                        )
                        articles.append(article)
                    except Exception as e:
                        logger.warning(f"Error parsing article: {e}")
                        continue
            
            return articles
            
        except Exception as e:
            logger.error(f"NewsAPI search failed: {e}")
            return []
    
    async def _search_rss_feeds(self, queries: List[str], location: str) -> List[NewsArticle]:
        """Search RSS feeds from reliable news sources"""
        articles = []
        
        # Reliable news RSS feeds
        rss_feeds = [
            "http://feeds.reuters.com/Reuters/worldNews",
            "https://feeds.bbci.co.uk/news/world/rss.xml",
            "https://rss.cnn.com/rss/edition.rss",
            "https://www.aljazeera.com/xml/rss/all.xml"
        ]
        
        for feed_url in rss_feeds:
            try:
                # Fetch RSS feed
                feed = feedparser.parse(feed_url)
                
                for entry in feed.entries[:10]:  # Limit per feed
                    # Check if entry is relevant to our queries
                    relevance = self._calculate_text_relevance(
                        f"{entry.title} {entry.summary}", queries
                    )
                    
                    if relevance > 0.3:  # Relevance threshold
                        article = NewsArticle(
                            title=entry.title,
                            url=entry.link,
                            source=feed.feed.get('title', 'RSS Feed'),
                            published_at=datetime(*entry.published_parsed[:6]) if hasattr(entry, 'published_parsed') else datetime.now(),
                            description=entry.summary if hasattr(entry, 'summary') else '',
                            content=None,
                            relevance_score=relevance,
                            credibility_score=0.8  # RSS feeds from major outlets
                        )
                        articles.append(article)
                        
            except Exception as e:
                logger.warning(f"RSS feed error for {feed_url}: {e}")
        
        return articles
    
    def _calculate_text_relevance(self, text: str, queries: List[str]) -> float:
        """Calculate how relevant a text is to search queries"""
        text_lower = text.lower()
        total_relevance = 0.0
        
        for query in queries:
            query_lower = query.lower()
            # Simple keyword matching
            if query_lower in text_lower:
                total_relevance += 1.0
            else:
                # Partial matching
                query_words = query_lower.split()
                matches = sum(1 for word in query_words if word in text_lower)
                if matches > 0:
                    total_relevance += matches / len(query_words) * 0.5
        
        return min(1.0, total_relevance / len(queries))
    
    def _calculate_source_credibility(self, source_name: str) -> float:
        """Calculate credibility score for news source"""
        high_credibility = [
            "reuters", "bbc", "associated press", "ap news", "npr", 
            "the guardian", "washington post", "new york times", "cnn",
            "al jazeera", "france 24", "dw", "abc news"
        ]
        
        medium_credibility = [
            "times of india", "hindu", "indianexpress", "ndtv", 
            "zee news", "india today", "economic times"
        ]
        
        source_lower = source_name.lower()
        
        for source in high_credibility:
            if source in source_lower:
                return 0.9
        
        for source in medium_credibility:
            if source in source_lower:
                return 0.7
        
        return 0.5  # Default credibility
    
    async def _search_fact_checks(self, claim_text: str, location: str) -> List[Dict[str, Any]]:
        """Search fact-checking websites for related claims"""
        fact_checks = []
        
        # Generate fact-check queries
        queries = [
            f'"{location}" fact check',
            f'"{claim_text[:50]}" verify',
            f'{location} hoax misinformation'
        ]
        
        # Search Google Fact Check API if available
        google_api_key = os.getenv("GOOGLE_FACT_CHECK_API_KEY")
        if google_api_key:
            for query in queries[:2]:  # Limit to avoid rate limits
                try:
                    fact_check_result = await self._search_google_fact_check(query, google_api_key)
                    fact_checks.extend(fact_check_result)
                except Exception as e:
                    logger.warning(f"Google Fact Check API error: {e}")
        
        # Manual search of fact-checking websites
        manual_checks = await self._manual_fact_check_search(queries[:2])
        fact_checks.extend(manual_checks)
        
        return fact_checks
    
    async def _search_google_fact_check(self, query: str, api_key: str) -> List[Dict[str, Any]]:
        """Search Google Fact Check Tools API"""
        try:
            url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
            params = {
                "key": api_key,
                "query": query,
                "languageCode": "en"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    fact_checks = []
                    for claim in data.get("claims", []):
                        for review in claim.get("claimReview", []):
                            fact_check = {
                                "claim": claim.get("text", ""),
                                "review_url": review.get("url", ""),
                                "reviewer": review.get("publisher", {}).get("name", ""),
                                "rating": review.get("textualRating", ""),
                                "date": review.get("reviewDate", ""),
                                "source": "Google Fact Check API"
                            }
                            fact_checks.append(fact_check)
                    
                    return fact_checks
                    
        except Exception as e:
            logger.error(f"Google Fact Check API error: {e}")
        
        return []
    
    async def _manual_fact_check_search(self, queries: List[str]) -> List[Dict[str, Any]]:
        """Manual search of major fact-checking websites"""
        fact_checks = []
        
        # Search major fact-checking sites
        search_urls = {
            "Snopes": "https://www.snopes.com/search/{}",
            "FactCheck.org": "https://www.factcheck.org/?s={}",
            "PolitiFact": "https://www.politifact.com/search/?q={}"
        }
        
        for query in queries[:1]:  # Limit to avoid overwhelming requests
            encoded_query = quote_plus(query)
            
            for site_name, url_template in search_urls.items():
                try:
                    search_url = url_template.format(encoded_query)
                    
                    async with httpx.AsyncClient() as client:
                        response = await client.get(search_url, timeout=10)
                        
                        if response.status_code == 200:
                            # Basic parsing to find fact-check articles
                            soup = BeautifulSoup(response.content, 'html.parser')
                            
                            # Look for article links (site-specific selectors would be better)
                            links = soup.find_all('a', href=True)
                            for link in links[:3]:  # Top 3 results
                                if any(keyword in link.get('href', '').lower() for keyword in ['fact', 'check', 'verify']):
                                    fact_check = {
                                        "claim": link.get_text(strip=True)[:100],
                                        "review_url": link['href'],
                                        "reviewer": site_name,
                                        "rating": "Found",
                                        "date": datetime.now().isoformat(),
                                        "source": f"Manual search - {site_name}"
                                    }
                                    fact_checks.append(fact_check)
                        
                except Exception as e:
                    logger.warning(f"Manual fact-check search error for {site_name}: {e}")
        
        return fact_checks
    
    def _deduplicate_articles(self, articles: List[NewsArticle]) -> List[NewsArticle]:
        """Remove duplicate articles based on title similarity"""
        if not articles:
            return []
        
        unique_articles = []
        seen_titles = set()
        
        for article in articles:
            # Normalize title for comparison
            normalized_title = ' '.join(article.title.lower().split())
            
            # Check if we've seen a very similar title
            is_duplicate = False
            for seen_title in seen_titles:
                if self._calculate_title_similarity(normalized_title, seen_title) > 0.8:
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                unique_articles.append(article)
                seen_titles.add(normalized_title)
        
        return unique_articles
    
    def _calculate_title_similarity(self, title1: str, title2: str) -> float:
        """Calculate similarity between two titles"""
        words1 = set(title1.split())
        words2 = set(title2.split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union)
    
    async def _rank_articles_by_relevance(
        self, 
        articles: List[NewsArticle], 
        claim_text: str
    ) -> List[NewsArticle]:
        """Rank articles by relevance to the claim using AI"""
        if not articles or not self.sentence_model:
            return articles
        
        try:
            # Generate embedding for claim text
            claim_embedding = self.sentence_model.encode([claim_text])
            
            # Generate embeddings for article texts
            article_texts = [f"{article.title} {article.description}" for article in articles]
            article_embeddings = self.sentence_model.encode(article_texts)
            
            # Calculate cosine similarity
            similarities = np.dot(article_embeddings, claim_embedding.T).flatten()
            
            # Update relevance scores and sort
            for i, article in enumerate(articles):
                article.relevance_score = float(similarities[i])
            
            # Sort by relevance score
            articles.sort(key=lambda x: x.relevance_score, reverse=True)
            
        except Exception as e:
            logger.warning(f"Article ranking failed, using original order: {e}")
        
        return articles
    
    async def _analyze_with_ai(
        self, 
        claim_text: str, 
        articles: List[NewsArticle], 
        fact_checks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Use OpenAI to analyze news articles and fact-checks against the claim"""
        if not self.openai_client or not articles:
            return {
                "summary": "Unable to perform AI analysis",
                "supporting_evidence": [],
                "contradicting_evidence": [],
                "confidence": 0.5
            }
        
        try:
            # Prepare context from articles
            articles_context = ""
            for i, article in enumerate(articles[:10], 1):  # Top 10 articles
                articles_context += f"\n{i}. {article.title}\n"
                articles_context += f"   Source: {article.source} ({article.published_at.strftime('%Y-%m-%d')})\n"
                articles_context += f"   {article.description[:200]}...\n"
            
            # Prepare fact-check context
            fact_check_context = ""
            for i, fact_check in enumerate(fact_checks[:5], 1):  # Top 5 fact-checks
                fact_check_context += f"\n{i}. {fact_check.get('claim', '')}\n"
                fact_check_context += f"   Reviewer: {fact_check.get('reviewer', '')}\n"
                fact_check_context += f"   Rating: {fact_check.get('rating', '')}\n"
            
            # Create prompt for AI analysis
            prompt = f"""
            Analyze the following aid request/claim against the provided news articles and fact-checks:
            
            CLAIM TO VERIFY:
            "{claim_text}"
            
            RELEVANT NEWS ARTICLES:
            {articles_context}
            
            FACT-CHECK RESULTS:
            {fact_check_context}
            
            Please provide a structured analysis:
            
            1. VERIFICATION STATUS: Choose one of:
               - VERIFIED: Strong evidence supports the claim
               - PARTIALLY_VERIFIED: Some evidence supports parts of the claim
               - UNVERIFIED: No evidence found to support the claim
               - CONTRADICTED: Evidence contradicts the claim
            
            2. CONFIDENCE SCORE: Rate your confidence from 0.0 to 1.0
            
            3. SUPPORTING EVIDENCE: List specific articles/sources that support the claim
            
            4. CONTRADICTING EVIDENCE: List any evidence that contradicts the claim
            
            5. SUMMARY: Provide a concise summary of your findings (max 200 words)
            
            Return your response in JSON format.
            """
            
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are an expert fact-checker and news analyst. Always return valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1,
                    max_tokens=1500
                )
            )
            
            # Parse AI response
            ai_response = response.choices[0].message.content.strip()
            # Clean JSON if it has markdown formatting
            ai_response = re.sub(r'```json\n?|```\n?', '', ai_response)
            
            return json.loads(ai_response)
            
        except Exception as e:
            logger.error(f"AI analysis failed: {e}")
            return {
                "verification_status": "UNVERIFIED",
                "confidence_score": 0.5,
                "supporting_evidence": [],
                "contradicting_evidence": [],
                "summary": f"AI analysis failed: {str(e)}"
            }
    
    def _calculate_verification_status(
        self, 
        ai_analysis: Dict[str, Any], 
        articles: List[NewsArticle], 
        fact_checks: List[Dict[str, Any]]
    ) -> NewsVerification:
        """Calculate final verification status based on all evidence"""
        
        # Get AI analysis results
        ai_status = ai_analysis.get("verification_status", "UNVERIFIED")
        ai_confidence = ai_analysis.get("confidence_score", 0.5)
        ai_summary = ai_analysis.get("summary", "No summary available")
        
        # Separate supporting and contradicting articles
        supporting_articles = []
        contradicting_articles = []
        
        supporting_evidence = ai_analysis.get("supporting_evidence", [])
        contradicting_evidence = ai_analysis.get("contradicting_evidence", [])
        
        for article in articles:
            article_dict = {
                "title": article.title,
                "url": article.url,
                "source": article.source,
                "published_at": article.published_at.isoformat(),
                "relevance_score": article.relevance_score,
                "credibility_score": article.credibility_score
            }
            
            # Simple matching to categorize articles
            if any(article.title.lower() in evidence.lower() for evidence in supporting_evidence):
                supporting_articles.append(article_dict)
            elif any(article.title.lower() in evidence.lower() for evidence in contradicting_evidence):
                contradicting_articles.append(article_dict)
            elif article.relevance_score > 0.7:  # High relevance articles as supporting
                supporting_articles.append(article_dict)
        
        # Calculate final confidence based on multiple factors
        final_confidence = ai_confidence
        
        # Boost confidence if we have high-credibility supporting articles
        if supporting_articles:
            avg_credibility = sum(a["credibility_score"] for a in supporting_articles) / len(supporting_articles)
            final_confidence = min(1.0, final_confidence + (avg_credibility - 0.5) * 0.2)
        
        # Reduce confidence if we have contradicting evidence
        if contradicting_articles:
            final_confidence = max(0.1, final_confidence - 0.3)
        
        # Map AI status to our verification status
        status_mapping = {
            "VERIFIED": "verified",
            "PARTIALLY_VERIFIED": "partially_verified", 
            "UNVERIFIED": "unverified",
            "CONTRADICTED": "contradicted"
        }
        
        final_status = status_mapping.get(ai_status, "unverified")
        
        return NewsVerification(
            verification_status=final_status,
            confidence_score=round(final_confidence, 2),
            supporting_articles=supporting_articles,
            contradicting_articles=contradicting_articles,
            fact_check_results=fact_checks,
            ai_summary=ai_summary,
            verification_details={
                "ai_analysis": ai_analysis,
                "total_articles_analyzed": len(articles),
                "total_fact_checks": len(fact_checks),
                "analysis_timestamp": datetime.now().isoformat()
            },
            last_updated=datetime.now()
        )

# Utility functions for external use
async def quick_verify_claim(claim: str, location: str = None) -> Dict[str, Any]:
    """
    Quick verification function for API endpoints
    Returns simplified verification result
    """
    verifier = NewsVerificationAI()
    
    # Determine incident type from claim
    incident_type = "general"
    claim_lower = claim.lower()
    
    if any(word in claim_lower for word in ["flood", "flooding", "water"]):
        incident_type = "flood"
    elif any(word in claim_lower for word in ["earthquake", "seismic", "tremor"]):
        incident_type = "earthquake"
    elif any(word in claim_lower for word in ["medical", "hospital", "treatment", "surgery"]):
        incident_type = "medical"
    elif any(word in claim_lower for word in ["fire", "wildfire", "blaze"]):
        incident_type = "fire"
    
    result = await verifier.verify_aid_request(
        claim_text=claim,
        location=location or "unknown",
        incident_type=incident_type,
        time_window_days=14
    )
    
    return {
        "verified": result.verification_status == "verified",
        "status": result.verification_status,
        "confidence": result.confidence_score,
        "summary": result.ai_summary,
        "sources_count": len(result.supporting_articles),
        "last_updated": result.last_updated.isoformat()
    }

# Test function
async def test_news_verification():
    """Test the news verification system"""
    test_claims = [
        ("Floods in Village A require immediate aid", "Village A"),
        ("Mumbai hospital needs medical supplies urgently", "Mumbai"),
        ("Earthquake victims in Gujarat need shelter", "Gujarat"),
        ("Children in Delhi schools lack basic facilities", "Delhi")
    ]
    
    for claim, location in test_claims:
        print(f"\n🧪 Testing: {claim}")
        result = await quick_verify_claim(claim, location)
        print(f"  ✅ Status: {result['status']} | Confidence: {result['confidence']:.2f}")
        print(f"  📰 Sources: {result['sources_count']} | Summary: {result['summary'][:100]}...")

if __name__ == "__main__":
    # Run test when executed directly
    asyncio.run(test_news_verification())
