"""
AI-Powered Needs Detection Service
Uses OpenAI GPT-4o and HuggingFace transformers for extracting structured needs from unstructured text
"""

import os
import json
import re
from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass

# AI Libraries
import openai
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# Utilities
import requests
import asyncio
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class DetectedNeed:
    """Structured representation of a detected need"""
    need_type: str
    quantity: Optional[int]
    urgency_level: str  # "low", "medium", "high", "critical"
    location: Optional[str]
    description: str
    confidence_score: float
    source_text: str
    extracted_entities: Dict[str, Any]
    verification_status: str = "pending"

class NeedsDetectionAI:
    """
    Main class for AI-powered needs detection from unstructured text
    """
    
    def __init__(self):
        self.openai_client = None
        self.classifier = None
        self.sentiment_analyzer = SentimentIntensityAnalyzer()
        self.need_categories = [
            "water", "food", "medicine", "shelter", "clothing", 
            "medical_equipment", "blankets", "education", "transport", "emergency_rescue"
        ]
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize AI models"""
        try:
            # Initialize OpenAI
            openai_api_key = os.getenv("OPENAI_API_KEY")
            if openai_api_key:
                self.openai_client = openai.OpenAI(api_key=openai_api_key)
                logger.info("✅ OpenAI GPT-4o initialized")
            else:
                logger.warning("⚠️ OPENAI_API_KEY not found - using fallback models")
            
            # Initialize HuggingFace zero-shot classifier
            try:
                self.classifier = pipeline(
                    "zero-shot-classification",
                    model="facebook/bart-large-mnli",
                    device=0 if torch.cuda.is_available() else -1
                )
                logger.info("✅ HuggingFace BART classifier initialized")
            except Exception as e:
                logger.warning(f"⚠️ HuggingFace model loading failed: {e}")
                
        except Exception as e:
            logger.error(f"❌ Model initialization failed: {e}")
    
    async def extract_needs_from_text(self, text: str, source: str = "social_media") -> List[DetectedNeed]:
        """
        Main method to extract structured needs from unstructured text
        
        Args:
            text: Input text (social media post, NGO message, news article)
            source: Source type for context
            
        Returns:
            List of DetectedNeed objects
        """
        try:
            # Clean and preprocess text
            cleaned_text = self._preprocess_text(text)
            
            # Try OpenAI GPT-4o first (best results)
            if self.openai_client:
                gpt_results = await self._extract_with_gpt4o(cleaned_text, source)
                if gpt_results:
                    return gpt_results
            
            # Fallback to HuggingFace transformers
            hf_results = await self._extract_with_huggingface(cleaned_text, source)
            return hf_results
            
        except Exception as e:
            logger.error(f"❌ Needs extraction failed: {e}")
            return []
    
    def _preprocess_text(self, text: str) -> str:
        """Clean and normalize input text"""
        # Remove URLs, mentions, hashtags for cleaner processing
        text = re.sub(r'http\S+|www\S+|@\w+|#\w+', '', text)
        # Remove extra whitespace
        text = ' '.join(text.split())
        # Basic text normalization
        text = text.strip()
        return text
    
    async def _extract_with_gpt4o(self, text: str, source: str) -> List[DetectedNeed]:
        """Extract needs using OpenAI GPT-4o with structured JSON output"""
        try:
            prompt = f"""
            Parse the following {source} text and extract any humanitarian needs mentioned.
            Return a JSON array of needs found. For each need, provide:
            
            - need_type: Type of need (water, food, medicine, shelter, etc.)
            - quantity: Estimated quantity needed (number if mentioned, null if not)
            - urgency_level: Urgency level (low, medium, high, critical)
            - location: Location mentioned (null if not specified)
            - description: Brief description of the need
            - confidence_score: Your confidence in this extraction (0.0 to 1.0)
            
            Text to analyze:
            "{text}"
            
            Return only valid JSON array format. If no needs are found, return an empty array [].
            """
            
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.openai_client.chat.completions.create(
                    model="gpt-4o-mini",  # Using mini for faster responses
                    messages=[
                        {"role": "system", "content": "You are an expert at extracting humanitarian needs from text. Always return valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1,
                    max_tokens=1000
                )
            )
            
            # Parse JSON response
            json_text = response.choices[0].message.content.strip()
            # Clean JSON if it has markdown formatting
            json_text = re.sub(r'```json\n?|```\n?', '', json_text)
            
            needs_data = json.loads(json_text)
            
            # Convert to DetectedNeed objects
            detected_needs = []
            for need_data in needs_data:
                detected_need = DetectedNeed(
                    need_type=need_data.get("need_type", "unknown"),
                    quantity=need_data.get("quantity"),
                    urgency_level=need_data.get("urgency_level", "medium"),
                    location=need_data.get("location"),
                    description=need_data.get("description", text[:100] + "..."),
                    confidence_score=float(need_data.get("confidence_score", 0.7)),
                    source_text=text,
                    extracted_entities=need_data,
                    verification_status="ai_detected"
                )
                detected_needs.append(detected_need)
                
            logger.info(f"✅ GPT-4o extracted {len(detected_needs)} needs")
            return detected_needs
            
        except Exception as e:
            logger.error(f"❌ GPT-4o extraction failed: {e}")
            return []
    
    async def _extract_with_huggingface(self, text: str, source: str) -> List[DetectedNeed]:
        """Fallback extraction using HuggingFace transformers"""
        try:
            detected_needs = []
            
            if self.classifier:
                # Classify text into need categories
                result = self.classifier(text, self.need_categories)
                
                # Get sentiment for urgency assessment
                sentiment = self.sentiment_analyzer.polarity_scores(text)
                
                # Extract top predictions
                for i, (label, score) in enumerate(zip(result['labels'], result['scores'])):
                    if score > 0.3:  # Confidence threshold
                        # Determine urgency from sentiment and keywords
                        urgency = self._determine_urgency(text, sentiment)
                        
                        # Extract location using simple regex
                        location = self._extract_location(text)
                        
                        # Extract quantity if mentioned
                        quantity = self._extract_quantity(text)
                        
                        detected_need = DetectedNeed(
                            need_type=label,
                            quantity=quantity,
                            urgency_level=urgency,
                            location=location,
                            description=f"Detected {label} need from {source}",
                            confidence_score=float(score),
                            source_text=text,
                            extracted_entities={
                                "classification_scores": dict(zip(result['labels'], result['scores'])),
                                "sentiment": sentiment
                            },
                            verification_status="ai_classified"
                        )
                        detected_needs.append(detected_need)
                        
                        # Only take top 3 predictions
                        if i >= 2:
                            break
            
            logger.info(f"✅ HuggingFace extracted {len(detected_needs)} needs")
            return detected_needs
            
        except Exception as e:
            logger.error(f"❌ HuggingFace extraction failed: {e}")
            return []
    
    def _determine_urgency(self, text: str, sentiment: Dict) -> str:
        """Determine urgency level from text content and sentiment"""
        text_lower = text.lower()
        
        # Critical keywords
        if any(word in text_lower for word in ["urgent", "emergency", "critical", "immediately", "dying", "life-threatening"]):
            return "critical"
        
        # High urgency keywords
        if any(word in text_lower for word in ["help", "asap", "soon", "needed", "crisis"]):
            return "high"
        
        # Medium urgency (negative sentiment)
        if sentiment['compound'] < -0.3:
            return "medium"
        
        return "low"
    
    def _extract_location(self, text: str) -> Optional[str]:
        """Extract location mentions using regex patterns"""
        # Simple location patterns (can be enhanced with NER models)
        location_patterns = [
            r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:district|city|village|town|state)))\b',
            r'\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b',
            r'\bat\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b'
        ]
        
        for pattern in location_patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                return match.group(1)
        
        return None
    
    def _extract_quantity(self, text: str) -> Optional[int]:
        """Extract quantity mentions from text"""
        # Look for numbers in the text
        number_patterns = [
            r'\b(\d+)\s+(?:people|persons|families|children|adults|items|liters|kg|tons|bags)\b',
            r'\b(\d+)\s+(?:need|needs|require|requires)\b',
            r'\bfor\s+(\d+)\s+',
            r'\b(\d+)\s*[-–—]\s*\d+\b'  # Range of numbers
        ]
        
        for pattern in number_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                try:
                    return int(match.group(1))
                except ValueError:
                    continue
        
        return None

# Utility functions for external use
async def detect_needs_from_social_post(post_text: str) -> List[Dict[str, Any]]:
    """
    Quick function to detect needs from social media posts
    Returns simplified dict format for API responses
    """
    detector = NeedsDetectionAI()
    needs = await detector.extract_needs_from_text(post_text, "social_media")
    
    return [
        {
            "need": need.need_type,
            "quantity": need.quantity,
            "urgency": need.urgency_level,
            "location": need.location,
            "confidence": need.confidence_score,
            "description": need.description
        }
        for need in needs
    ]

async def detect_needs_from_ngo_message(message_text: str) -> List[Dict[str, Any]]:
    """
    Detect needs from NGO messages with higher confidence weighting
    """
    detector = NeedsDetectionAI()
    needs = await detector.extract_needs_from_text(message_text, "ngo_message")
    
    # Boost confidence for NGO sources
    for need in needs:
        need.confidence_score = min(1.0, need.confidence_score + 0.2)
    
    return [
        {
            "need": need.need_type,
            "quantity": need.quantity,
            "urgency": need.urgency_level,
            "location": need.location,
            "confidence": need.confidence_score,
            "description": need.description,
            "source": "ngo_verified"
        }
        for need in needs
    ]

# Test function
async def test_needs_detection():
    """Test function to validate the needs detection system"""
    test_cases = [
        "Village A needs water urgently. 500 people affected by drought.",
        "Emergency! Children in Mumbai need medical supplies immediately. Food shortage for 200 families.",
        "Flood relief needed in Patna. Clean water access for 1000 people.",
        "School in rural Bengal lacks books and uniforms for 80 students.",
        "Earthquake victims in Gujarat need shelter and blankets for 300 families."
    ]
    
    detector = NeedsDetectionAI()
    
    for i, test_text in enumerate(test_cases, 1):
        print(f"\n🧪 Test Case {i}: {test_text}")
        needs = await detector.extract_needs_from_text(test_text)
        
        for need in needs:
            print(f"  ✅ Detected: {need.need_type} | Qty: {need.quantity} | Urgency: {need.urgency_level} | Confidence: {need.confidence_score:.2f}")

if __name__ == "__main__":
    # Run test when executed directly
    asyncio.run(test_needs_detection())
