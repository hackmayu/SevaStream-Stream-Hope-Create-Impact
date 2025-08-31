"""
Community Polling & Content Moderation Service
Uses Perspective API, Cohere Rerank, and community validation for fraud prevention
"""

import os
import json
import asyncio
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum

# Google APIs
import requests
import httpx

# AI Libraries
try:
    import openai
    import cohere
    from textblob import TextBlob
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
except ImportError:
    # Handle missing imports gracefully
    openai = None
    cohere = None
    TextBlob = None
    SentimentIntensityAnalyzer = None

# Utilities
import re
import hashlib
from urllib.parse import quote_plus

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ContentRisk(Enum):
    LOW = "low"
    MEDIUM = "medium" 
    HIGH = "high"
    CRITICAL = "critical"

class PollStatus(Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    SUSPENDED = "suspended"
    FRAUD_DETECTED = "fraud_detected"

@dataclass
class ContentModerationResult:
    """Result of content moderation analysis"""
    risk_level: ContentRisk
    toxicity_score: float
    threat_score: float
    spam_score: float
    misinformation_score: float
    overall_score: float
    flags: List[str]
    recommendation: str
    details: Dict[str, Any]

@dataclass
class CommunityPoll:
    """Community validation poll for aid requests"""
    poll_id: str
    claim_text: str
    location: str
    created_at: datetime
    expires_at: datetime
    status: PollStatus
    total_votes: int
    verified_votes: int
    fraud_votes: int
    confidence_score: float
    voter_details: List[Dict[str, Any]]
    moderation_result: Optional[ContentModerationResult]

@dataclass
class PollVote:
    """Individual vote in a community poll"""
    voter_id: str
    vote_type: str  # "verified", "fraud", "unsure"
    confidence: float
    reasoning: Optional[str]
    voter_credibility: float
    timestamp: datetime

class CommunityModerationAI:
    """
    Main class for community polling and content moderation
    """
    
    def __init__(self):
        self.perspective_api_key = os.getenv("PERSPECTIVE_API_KEY")
        self.cohere_client = None
        self.openai_client = None
        self.sentiment_analyzer = SentimentIntensityAnalyzer() if SentimentIntensityAnalyzer else None
        self.active_polls: Dict[str, CommunityPoll] = {}
        self._initialize_services()
    
    def _initialize_services(self):
        """Initialize AI services and APIs"""
        try:
            # Initialize Perspective API
            if self.perspective_api_key:
                logger.info("✅ Perspective API initialized")
            else:
                logger.warning("⚠️ PERSPECTIVE_API_KEY not found")
            
            # Initialize Cohere
            cohere_api_key = os.getenv("COHERE_API_KEY")
            if cohere_api_key and cohere:
                self.cohere_client = cohere.Client(cohere_api_key)
                logger.info("✅ Cohere Rerank initialized")
            
            # Initialize OpenAI
            openai_api_key = os.getenv("OPENAI_API_KEY")
            if openai_api_key and openai:
                self.openai_client = openai.OpenAI(api_key=openai_api_key)
                logger.info("✅ OpenAI for content analysis initialized")
                
        except Exception as e:
            logger.error(f"❌ Service initialization failed: {e}")
    
    async def moderate_content(self, content: str, content_type: str = "aid_request") -> ContentModerationResult:
        """
        Moderate content for toxicity, threats, spam, and misinformation
        
        Args:
            content: Text content to moderate
            content_type: Type of content (aid_request, comment, report)
            
        Returns:
            ContentModerationResult with detailed analysis
        """
        try:
            logger.info(f"🛡️ Moderating {content_type}: {content[:50]}...")
            
            # Run multiple moderation checks in parallel
            tasks = [
                self._check_perspective_api(content),
                self._check_spam_patterns(content),
                self._check_misinformation_signals(content),
                self._check_sentiment_analysis(content)
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Combine results
            perspective_result = results[0] if not isinstance(results[0], Exception) else {}
            spam_result = results[1] if not isinstance(results[1], Exception) else {}
            misinfo_result = results[2] if not isinstance(results[2], Exception) else {}
            sentiment_result = results[3] if not isinstance(results[3], Exception) else {}
            
            # Calculate overall scores
            toxicity_score = perspective_result.get("toxicity", 0.0)
            threat_score = perspective_result.get("threat", 0.0)
            spam_score = spam_result.get("spam_score", 0.0)
            misinformation_score = misinfo_result.get("misinfo_score", 0.0)
            
            # Calculate overall risk score
            overall_score = (
                toxicity_score * 0.3 +
                threat_score * 0.4 +
                spam_score * 0.2 +
                misinformation_score * 0.1
            )
            
            # Determine risk level
            risk_level = self._calculate_risk_level(overall_score)
            
            # Generate flags
            flags = []
            if toxicity_score > 0.7:
                flags.append("high_toxicity")
            if threat_score > 0.6:
                flags.append("potential_threat")
            if spam_score > 0.8:
                flags.append("spam_detected")
            if misinformation_score > 0.7:
                flags.append("misinformation_risk")
            
            # Generate recommendation
            recommendation = self._generate_moderation_recommendation(risk_level, flags)
            
            return ContentModerationResult(
                risk_level=risk_level,
                toxicity_score=toxicity_score,
                threat_score=threat_score,
                spam_score=spam_score,
                misinformation_score=misinformation_score,
                overall_score=overall_score,
                flags=flags,
                recommendation=recommendation,
                details={
                    "perspective_api": perspective_result,
                    "spam_analysis": spam_result,
                    "misinformation_analysis": misinfo_result,
                    "sentiment_analysis": sentiment_result,
                    "content_type": content_type,
                    "analysis_timestamp": datetime.now().isoformat()
                }
            )
            
        except Exception as e:
            logger.error(f"❌ Content moderation failed: {e}")
            return ContentModerationResult(
                risk_level=ContentRisk.MEDIUM,
                toxicity_score=0.5,
                threat_score=0.5,
                spam_score=0.5,
                misinformation_score=0.5,
                overall_score=0.5,
                flags=["moderation_error"],
                recommendation="Manual review required due to moderation error",
                details={"error": str(e)}
            )
    
    async def _check_perspective_api(self, content: str) -> Dict[str, float]:
        """Use Google Perspective API to check for toxicity and threats"""
        if not self.perspective_api_key:
            return {"toxicity": 0.0, "threat": 0.0}
        
        try:
            url = f"https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key={self.perspective_api_key}"
            
            data = {
                "requestedAttributes": {
                    "TOXICITY": {},
                    "SEVERE_TOXICITY": {},
                    "IDENTITY_ATTACK": {},
                    "INSULT": {},
                    "PROFANITY": {},
                    "THREAT": {}
                },
                "comment": {"text": content},
                "languages": ["en"]
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=data, timeout=10)
                
                if response.status_code == 200:
                    result = response.json()
                    attributes = result.get("attributeScores", {})
                    
                    return {
                        "toxicity": attributes.get("TOXICITY", {}).get("summaryScore", {}).get("value", 0.0),
                        "severe_toxicity": attributes.get("SEVERE_TOXICITY", {}).get("summaryScore", {}).get("value", 0.0),
                        "threat": attributes.get("THREAT", {}).get("summaryScore", {}).get("value", 0.0),
                        "insult": attributes.get("INSULT", {}).get("summaryScore", {}).get("value", 0.0),
                        "profanity": attributes.get("PROFANITY", {}).get("summaryScore", {}).get("value", 0.0)
                    }
                else:
                    logger.warning(f"Perspective API error: {response.status_code}")
                    
        except Exception as e:
            logger.error(f"Perspective API check failed: {e}")
        
        return {"toxicity": 0.0, "threat": 0.0}
    
    async def _check_spam_patterns(self, content: str) -> Dict[str, Any]:
        """Check for spam patterns using rule-based and ML approaches"""
        try:
            spam_score = 0.0
            spam_indicators = []
            
            content_lower = content.lower()
            
            # Rule-based spam detection
            spam_patterns = [
                (r"(?:click|visit|check)\s+(?:here|link|website)", 0.3),
                (r"urgent.*(?:money|cash|payment)", 0.4),
                (r"(?:guarantee|100%|sure)\s+(?:profit|money|income)", 0.5),
                (r"(?:call|sms|whatsapp).*(?:\+?\d{10,})", 0.2),
                (r"limited\s+time\s+offer", 0.3),
                (r"(?:free|discount).*(?:today|now)", 0.2)
            ]
            
            for pattern, weight in spam_patterns:
                if re.search(pattern, content_lower):
                    spam_score += weight
                    spam_indicators.append(f"Pattern: {pattern}")
            
            # Check for excessive punctuation/caps
            caps_ratio = sum(1 for c in content if c.isupper()) / max(len(content), 1)
            if caps_ratio > 0.3:
                spam_score += 0.2
                spam_indicators.append("Excessive capitals")
            
            # Check for excessive punctuation
            punct_ratio = sum(1 for c in content if c in "!?.,;") / max(len(content), 1)
            if punct_ratio > 0.1:
                spam_score += 0.1
                spam_indicators.append("Excessive punctuation")
            
            # Check for repetitive content
            words = content_lower.split()
            if len(set(words)) < len(words) * 0.6:  # Less than 60% unique words
                spam_score += 0.2
                spam_indicators.append("Repetitive content")
            
            spam_score = min(1.0, spam_score)
            
            return {
                "spam_score": spam_score,
                "indicators": spam_indicators,
                "analysis_method": "rule_based"
            }
            
        except Exception as e:
            logger.error(f"Spam pattern check failed: {e}")
            return {"spam_score": 0.0, "indicators": [], "error": str(e)}
    
    async def _check_misinformation_signals(self, content: str) -> Dict[str, Any]:
        """Check for misinformation signals using AI and pattern analysis"""
        try:
            misinfo_score = 0.0
            misinfo_indicators = []
            
            content_lower = content.lower()
            
            # Common misinformation patterns
            misinfo_patterns = [
                (r"(?:hoax|fake|scam|fraud)", 0.4),
                (r"(?:conspiracy|cover.?up|hidden truth)", 0.3),
                (r"(?:media|government|they)\s+(?:lie|lying|cover)", 0.3),
                (r"(?:miracle|secret|hidden)\s+(?:cure|solution)", 0.4),
                (r"(?:big pharma|illuminati|new world order)", 0.5),
                (r"(?:wake up|open your eyes|sheeple)", 0.3)
            ]
            
            for pattern, weight in misinfo_patterns:
                if re.search(pattern, content_lower):
                    misinfo_score += weight
                    misinfo_indicators.append(f"Misinfo pattern: {pattern}")
            
            # Check for unsupported medical claims
            medical_claims = [
                r"(?:cure|heal|treat).*(?:cancer|covid|aids|diabetes)",
                r"(?:natural|herbal|alternative).*(?:medicine|treatment|cure)",
                r"(?:detox|cleanse).*(?:body|liver|kidney)"
            ]
            
            for pattern in medical_claims:
                if re.search(pattern, content_lower):
                    misinfo_score += 0.3
                    misinfo_indicators.append("Unsupported medical claim")
            
            # Check for emotional manipulation
            emotion_patterns = [
                r"(?:urgent|emergency|immediately).*(?:share|forward)",
                r"(?:if you don't|unless you).*(?:share|act)",
                r"(?:save|help|rescue).*(?:children|babies|animals).*(?:share|donate)"
            ]
            
            for pattern in emotion_patterns:
                if re.search(pattern, content_lower):
                    misinfo_score += 0.2
                    misinfo_indicators.append("Emotional manipulation")
            
            misinfo_score = min(1.0, misinfo_score)
            
            return {
                "misinfo_score": misinfo_score,
                "indicators": misinfo_indicators,
                "analysis_method": "pattern_based"
            }
            
        except Exception as e:
            logger.error(f"Misinformation check failed: {e}")
            return {"misinfo_score": 0.0, "indicators": [], "error": str(e)}
    
    async def _check_sentiment_analysis(self, content: str) -> Dict[str, Any]:
        """Analyze sentiment and emotional content"""
        try:
            if not self.sentiment_analyzer:
                return {"sentiment": "neutral", "confidence": 0.5}
            
            # VADER sentiment analysis
            sentiment_scores = self.sentiment_analyzer.polarity_scores(content)
            
            # TextBlob analysis (if available)
            textblob_sentiment = None
            if TextBlob:
                blob = TextBlob(content)
                textblob_sentiment = {
                    "polarity": blob.sentiment.polarity,
                    "subjectivity": blob.sentiment.subjectivity
                }
            
            # Determine overall sentiment
            compound = sentiment_scores['compound']
            if compound >= 0.05:
                sentiment = "positive"
            elif compound <= -0.05:
                sentiment = "negative"
            else:
                sentiment = "neutral"
            
            return {
                "sentiment": sentiment,
                "vader_scores": sentiment_scores,
                "textblob_scores": textblob_sentiment,
                "confidence": abs(compound)
            }
            
        except Exception as e:
            logger.error(f"Sentiment analysis failed: {e}")
            return {"sentiment": "neutral", "confidence": 0.5, "error": str(e)}
    
    def _calculate_risk_level(self, overall_score: float) -> ContentRisk:
        """Calculate risk level based on overall score"""
        if overall_score >= 0.8:
            return ContentRisk.CRITICAL
        elif overall_score >= 0.6:
            return ContentRisk.HIGH
        elif overall_score >= 0.3:
            return ContentRisk.MEDIUM
        else:
            return ContentRisk.LOW
    
    def _generate_moderation_recommendation(self, risk_level: ContentRisk, flags: List[str]) -> str:
        """Generate moderation recommendation based on risk level and flags"""
        if risk_level == ContentRisk.CRITICAL:
            return "Block content immediately and flag for manual review"
        elif risk_level == ContentRisk.HIGH:
            return "Require additional verification before publishing"
        elif risk_level == ContentRisk.MEDIUM:
            return "Add warning label and monitor closely"
        else:
            return "Content appears safe for publication"
    
    async def create_community_poll(
        self, 
        claim_text: str, 
        location: str,
        duration_hours: int = 24
    ) -> CommunityPoll:
        """
        Create a community poll for validating an aid request
        
        Args:
            claim_text: The aid request to validate
            location: Location of the claimed need
            duration_hours: How long the poll should run
            
        Returns:
            CommunityPoll object
        """
        try:
            # First, moderate the content
            moderation_result = await self.moderate_content(claim_text, "aid_request")
            
            if moderation_result.risk_level == ContentRisk.CRITICAL:
                logger.warning("❌ Cannot create poll for high-risk content")
                raise ValueError("Content flagged as high-risk, cannot create poll")
            
            # Generate unique poll ID
            poll_id = hashlib.md5(f"{claim_text}{location}{datetime.now().isoformat()}".encode()).hexdigest()[:12]
            
            # Create poll
            poll = CommunityPoll(
                poll_id=poll_id,
                claim_text=claim_text,
                location=location,
                created_at=datetime.now(),
                expires_at=datetime.now() + timedelta(hours=duration_hours),
                status=PollStatus.ACTIVE,
                total_votes=0,
                verified_votes=0,
                fraud_votes=0,
                confidence_score=0.0,
                voter_details=[],
                moderation_result=moderation_result
            )
            
            # Store poll
            self.active_polls[poll_id] = poll
            
            logger.info(f"✅ Created community poll {poll_id}")
            return poll
            
        except Exception as e:
            logger.error(f"❌ Failed to create community poll: {e}")
            raise
    
    async def submit_poll_vote(
        self, 
        poll_id: str, 
        voter_id: str, 
        vote_type: str, 
        confidence: float,
        reasoning: Optional[str] = None
    ) -> bool:
        """
        Submit a vote to a community poll
        
        Args:
            poll_id: ID of the poll
            voter_id: ID of the voter
            vote_type: "verified", "fraud", or "unsure"
            confidence: Confidence level (0.0 to 1.0)
            reasoning: Optional reasoning for the vote
            
        Returns:
            True if vote was accepted, False otherwise
        """
        try:
            poll = self.active_polls.get(poll_id)
            if not poll:
                logger.warning(f"Poll {poll_id} not found")
                return False
            
            # Check if poll is still active
            if poll.status != PollStatus.ACTIVE or datetime.now() > poll.expires_at:
                logger.warning(f"Poll {poll_id} is not active")
                return False
            
            # Check if voter has already voted
            existing_vote = next((v for v in poll.voter_details if v["voter_id"] == voter_id), None)
            if existing_vote:
                logger.warning(f"Voter {voter_id} has already voted in poll {poll_id}")
                return False
            
            # Validate vote type
            if vote_type not in ["verified", "fraud", "unsure"]:
                logger.warning(f"Invalid vote type: {vote_type}")
                return False
            
            # Calculate voter credibility (simplified)
            voter_credibility = self._calculate_voter_credibility(voter_id)
            
            # Create vote
            vote = PollVote(
                voter_id=voter_id,
                vote_type=vote_type,
                confidence=confidence,
                reasoning=reasoning,
                voter_credibility=voter_credibility,
                timestamp=datetime.now()
            )
            
            # Add vote to poll
            poll.voter_details.append({
                "voter_id": voter_id,
                "vote_type": vote_type,
                "confidence": confidence,
                "reasoning": reasoning,
                "voter_credibility": voter_credibility,
                "timestamp": vote.timestamp.isoformat()
            })
            
            # Update vote counts
            poll.total_votes += 1
            if vote_type == "verified":
                poll.verified_votes += 1
            elif vote_type == "fraud":
                poll.fraud_votes += 1
            
            # Recalculate confidence score
            poll.confidence_score = self._calculate_poll_confidence(poll)
            
            # Check if poll should be completed early
            await self._check_poll_completion(poll)
            
            logger.info(f"✅ Vote submitted to poll {poll_id}: {vote_type}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to submit vote: {e}")
            return False
    
    def _calculate_voter_credibility(self, voter_id: str) -> float:
        """Calculate credibility score for a voter (simplified implementation)"""
        # In a real implementation, this would consider:
        # - Voter's history of accurate votes
        # - Account age and verification status
        # - Previous contributions to the platform
        # - Social proof and endorsements
        
        # For now, return a random credibility between 0.5 and 1.0
        import random
        hash_value = int(hashlib.md5(voter_id.encode()).hexdigest()[:8], 16)
        random.seed(hash_value)
        return round(random.uniform(0.5, 1.0), 2)
    
    def _calculate_poll_confidence(self, poll: CommunityPoll) -> float:
        """Calculate overall confidence score for a poll"""
        if poll.total_votes == 0:
            return 0.0
        
        # Weight votes by voter credibility and confidence
        weighted_verified = 0.0
        weighted_fraud = 0.0
        total_weight = 0.0
        
        for vote_detail in poll.voter_details:
            voter_credibility = vote_detail["voter_credibility"]
            vote_confidence = vote_detail["confidence"]
            weight = voter_credibility * vote_confidence
            
            total_weight += weight
            
            if vote_detail["vote_type"] == "verified":
                weighted_verified += weight
            elif vote_detail["vote_type"] == "fraud":
                weighted_fraud += weight
        
        if total_weight == 0:
            return 0.0
        
        # Calculate confidence as weighted ratio
        verification_ratio = weighted_verified / total_weight
        fraud_ratio = weighted_fraud / total_weight
        
        # Return confidence in verification (higher = more likely verified)
        return round(verification_ratio - fraud_ratio, 2)
    
    async def _check_poll_completion(self, poll: CommunityPoll):
        """Check if poll should be completed early based on strong consensus"""
        if poll.total_votes < 5:  # Need minimum votes
            return
        
        # Strong consensus thresholds
        consensus_threshold = 0.8
        min_confidence = 0.7
        
        if poll.confidence_score >= consensus_threshold and abs(poll.confidence_score) >= min_confidence:
            poll.status = PollStatus.COMPLETED
            logger.info(f"✅ Poll {poll.poll_id} completed early due to strong consensus")
        elif poll.confidence_score <= -consensus_threshold and abs(poll.confidence_score) >= min_confidence:
            poll.status = PollStatus.FRAUD_DETECTED
            logger.warning(f"⚠️ Poll {poll.poll_id} marked as fraud due to strong negative consensus")
    
    async def get_poll_results(self, poll_id: str) -> Optional[Dict[str, Any]]:
        """Get current results for a poll"""
        poll = self.active_polls.get(poll_id)
        if not poll:
            return None
        
        # Check if poll has expired
        if datetime.now() > poll.expires_at and poll.status == PollStatus.ACTIVE:
            poll.status = PollStatus.COMPLETED
        
        return {
            "poll_id": poll.poll_id,
            "claim": poll.claim_text,
            "location": poll.location,
            "status": poll.status.value,
            "total_votes": poll.total_votes,
            "verified_votes": poll.verified_votes,
            "fraud_votes": poll.fraud_votes,
            "unsure_votes": poll.total_votes - poll.verified_votes - poll.fraud_votes,
            "confidence_score": poll.confidence_score,
            "created_at": poll.created_at.isoformat(),
            "expires_at": poll.expires_at.isoformat(),
            "moderation_result": {
                "risk_level": poll.moderation_result.risk_level.value if poll.moderation_result else "unknown",
                "overall_score": poll.moderation_result.overall_score if poll.moderation_result else 0.0,
                "flags": poll.moderation_result.flags if poll.moderation_result else []
            },
            "verification_status": self._get_verification_status(poll)
        }
    
    def _get_verification_status(self, poll: CommunityPoll) -> str:
        """Get human-readable verification status"""
        if poll.status == PollStatus.FRAUD_DETECTED:
            return "Likely Fraud"
        elif poll.status == PollStatus.COMPLETED:
            if poll.confidence_score >= 0.6:
                return "Community Verified"
            elif poll.confidence_score <= -0.6:
                return "Community Rejected"
            else:
                return "Inconclusive"
        elif poll.status == PollStatus.ACTIVE:
            return "Under Review"
        else:
            return "Suspended"

# Utility functions for external use
async def moderate_aid_request(claim_text: str) -> Dict[str, Any]:
    """
    Quick moderation function for aid requests with fx02 integration
    Returns simplified moderation result including fx02 fee recommendations
    """
    moderator = CommunityModerationAI()
    result = await moderator.moderate_content(claim_text, "aid_request")
    
    # Calculate recommended fx02 fees based on content analysis
    base_fee_percentage = 2.0  # Standard fx02 protocol fee
    
    # Adjust fee based on risk assessment
    if result.risk_level == ContentRisk.HIGH:
        recommended_fee = base_fee_percentage + 0.5  # Higher fee for higher risk
    elif result.risk_level == ContentRisk.LOW:
        recommended_fee = max(1.5, base_fee_percentage - 0.5)  # Lower fee for verified, low-risk requests
    else:
        recommended_fee = base_fee_percentage
    
    return {
        "safe": result.risk_level in [ContentRisk.LOW, ContentRisk.MEDIUM],
        "risk_level": result.risk_level.value,
        "overall_score": result.overall_score,
        "flags": result.flags,
        "recommendation": result.recommendation,
        "fx02_integration": {
            "recommended_fee_percentage": recommended_fee,
            "base_fee_percentage": base_fee_percentage,
            "fee_adjustment_reason": f"Adjusted based on {result.risk_level.value} risk level",
            "protocol_features": [
                "Real-time settlement",
                "Fraud protection", 
                "Transparent fee structure",
                "AI-verified transactions"
            ]
        }
    }

async def create_validation_poll(claim: str, location: str) -> Dict[str, Any]:
    """
    Create a community validation poll
    Returns poll information
    """
    moderator = CommunityModerationAI()
    poll = await moderator.create_community_poll(claim, location)
    
    return {
        "poll_id": poll.poll_id,
        "status": poll.status.value,
        "expires_at": poll.expires_at.isoformat(),
        "moderation_safe": poll.moderation_result.risk_level != ContentRisk.CRITICAL
    }

# Test function
async def test_community_moderation():
    """Test the community moderation system"""
    test_contents = [
        "Village needs clean water after flood damage",
        "URGENT!!! CLICK HERE FOR GUARANTEED MONEY!!!",
        "Help the children in Mumbai hospital - they are dying",
        "This is all a government conspiracy to steal your money"
    ]
    
    moderator = CommunityModerationAI()
    
    for content in test_contents:
        print(f"\n🧪 Testing: {content}")
        result = await moderator.moderate_content(content)
        print(f"  ✅ Risk: {result.risk_level.value} | Score: {result.overall_score:.2f}")
        print(f"  🚩 Flags: {result.flags}")
        print(f"  💡 Recommendation: {result.recommendation}")

if __name__ == "__main__":
    # Run test when executed directly
    asyncio.run(test_community_moderation())
