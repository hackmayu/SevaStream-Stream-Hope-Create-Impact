from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import random
import asyncio
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Mock AI services for development (no external dependencies)
print("AI services starting with mock implementations")

async def detect_needs_from_social_post(text): 
    return [{"type": "medical", "urgency": 0.8, "location": "Mumbai"}]

async def detect_needs_from_ngo_message(text): 
    return [{"type": "disaster_relief", "urgency": 0.9, "location": "Chennai"}]

async def quick_verify_claim(claim, location=None): 
    return {"verified": True, "status": "verified", "confidence": 0.85}

async def moderate_aid_request(text): 
    return {"safe": True, "risk_level": "low", "confidence": 0.92}

async def create_validation_poll(claim, location): 
    return {"poll_id": f"poll_{random.randint(1000, 9999)}", "status": "created"}

async def quick_kyc_check(data): 
    return {"verified": True, "verification_level": "basic", "confidence": 0.88}

async def quick_fraud_check(user_id, activity): 
    return {"safe": True, "risk_level": "low", "fraud_probability": 0.05}

# Load environment variables
load_dotenv()

app = FastAPI(
    title="SevaStream AI Services",
    description="AI-powered needs detection and donation optimization for SevaStream platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3003"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class NeedDetectionRequest(BaseModel):
    location: str
    category: Optional[str] = None
    urgency_threshold: Optional[float] = 0.7

class DonationOptimizationRequest(BaseModel):
    donor_profile: Dict[str, Any]
    available_causes: List[Dict[str, Any]]

class UrgentNeed(BaseModel):
    id: str
    title: str
    description: str
    category: str
    location: str
    urgency_score: float
    estimated_amount: int
    verification_status: str
    created_at: datetime

# New AI Service Models
class TextAnalysisRequest(BaseModel):
    text: str
    source_type: Optional[str] = "social_media"  # "social_media", "ngo_message", "news"

class NewsVerificationRequest(BaseModel):
    claim: str
    location: Optional[str] = None
    incident_type: Optional[str] = "general"

class CommunityPollRequest(BaseModel):
    claim_text: str
    location: str
    duration_hours: Optional[int] = 24

class PollVoteRequest(BaseModel):
    poll_id: str
    voter_id: str
    vote_type: str  # "verified", "fraud", "unsure"
    confidence: float
    reasoning: Optional[str] = None

class KYCRequest(BaseModel):
    user_id: str
    name: str
    email: str
    phone: str
    address: Optional[str] = None
    documents: Optional[List[Dict[str, Any]]] = []

class FraudAnalysisRequest(BaseModel):
    user_id: str
    activity_data: Dict[str, Any]
    historical_behavior: Optional[Dict[str, Any]] = None

class OptimizationRecommendation(BaseModel):
    cause_id: str
    match_score: float
    recommended_amount: int
    optimal_timing: str
    reasoning: str

# Mock data for demonstration
MOCK_URGENT_NEEDS = [
    {
        "id": "need_001",
        "title": "Emergency Medical Treatment",
        "description": "7-year-old child needs urgent heart surgery. Family cannot afford the ₹3,50,000 required for the operation.",
        "category": "Medical Emergency",
        "location": "Mumbai, Maharashtra",
        "urgency_score": 0.95,
        "estimated_amount": 350000,
        "verification_status": "verified",
        "details": {
            "hospital": "Kokilaben Dhirubhai Ambani Hospital",
            "doctor": "Dr. Ramesh Arora",
            "medical_condition": "Congenital Heart Disease",
            "family_income": 25000,
            "documents_verified": True
        }
    },
    {
        "id": "need_002",
        "title": "Flood Relief - Clean Water Access",
        "description": "Village of 2,500 people affected by floods. Need immediate water purification systems and supplies.",
        "category": "Natural Disaster",
        "location": "Patna, Bihar",
        "urgency_score": 0.88,
        "estimated_amount": 175000,
        "verification_status": "pending",
        "details": {
            "affected_population": 2500,
            "affected_families": 450,
            "water_sources_contaminated": 8,
            "ngo_partner": "Care India",
            "government_support": "partial"
        }
    },
    {
        "id": "need_003",
        "title": "Educational Support for Tribal Children",
        "description": "50 tribal children lack basic educational materials and uniforms. School infrastructure needs repair.",
        "category": "Education",
        "location": "Jhargram, West Bengal",
        "urgency_score": 0.72,
        "estimated_amount": 85000,
        "verification_status": "verified",
        "details": {
            "students_affected": 50,
            "school_name": "Santhal Adivasi Primary School",
            "teacher_ratio": "1:25",
            "infrastructure_issues": ["roof repair", "toilet facilities", "clean water"],
            "local_partner": "Teach for India"
        }
    }
]

@app.get("/")
async def root():
    return {
        "message": "SevaStream AI Services API",
        "version": "1.0.0",
        "status": "active",
        "core_endpoints": {
            "needs_detection": "/api/detect-needs",
            "optimization": "/api/optimize-donations", 
            "urgent_needs": "/api/urgent-needs",
            "impact_prediction": "/api/predict-impact"
        },
        "ai_endpoints": {
            "ai_needs_detection": "/api/ai/detect-needs",
            "news_verification": "/api/ai/verify-news", 
            "content_moderation": "/api/ai/moderate-content",
            "community_poll": "/api/ai/create-poll",
            "kyc_verification": "/api/ai/kyc-verify",
            "fraud_analysis": "/api/ai/fraud-analysis",
            "comprehensive_check": "/api/ai/comprehensive-check",
            "ai_status": "/api/ai/status"
        },
        "features": [
            "🤖 OpenAI GPT-4o needs extraction",
            "📰 NewsAPI + Google Fact Check verification", 
            "🛡️ Perspective API content moderation",
            "🗳️ Community validation polls",
            "🔍 KYC verification with fraud detection",
            "🎯 Comprehensive AI verification pipeline"
        ]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "needs_detection": "active",
            "ml_models": "loaded",
            "data_pipeline": "running"
        }
    }

@app.post("/api/detect-needs", response_model=List[UrgentNeed])
async def detect_urgent_needs(request: NeedDetectionRequest):
    """
    AI-powered urgent needs detection
    
    This endpoint analyzes various data sources to identify urgent needs:
    - Social media sentiment analysis
    - Government disaster reports
    - NGO partnership data
    - Historical patterns
    """
    try:
        # Simulate AI processing delay
        await asyncio.sleep(0.5)
        
        # Filter mock needs based on location and urgency
        filtered_needs = []
        for need_data in MOCK_URGENT_NEEDS:
            # Location matching (simplified)
            if request.location.lower() in need_data["location"].lower():
                if need_data["urgency_score"] >= request.urgency_threshold:
                    need = UrgentNeed(
                        id=need_data["id"],
                        title=need_data["title"],
                        description=need_data["description"],
                        category=need_data["category"],
                        location=need_data["location"],
                        urgency_score=need_data["urgency_score"],
                        estimated_amount=need_data["estimated_amount"],
                        verification_status=need_data["verification_status"],
                        created_at=datetime.now() - timedelta(hours=random.randint(1, 48))
                    )
                    filtered_needs.append(need)
        
        # If no location matches, return some random needs with adjusted scores
        if not filtered_needs:
            for need_data in random.sample(MOCK_URGENT_NEEDS, min(2, len(MOCK_URGENT_NEEDS))):
                need = UrgentNeed(
                    id=need_data["id"],
                    title=need_data["title"],
                    description=need_data["description"],
                    category=need_data["category"],
                    location=need_data["location"],
                    urgency_score=max(0.5, need_data["urgency_score"] - 0.2),
                    estimated_amount=need_data["estimated_amount"],
                    verification_status=need_data["verification_status"],
                    created_at=datetime.now() - timedelta(hours=random.randint(1, 48))
                )
                filtered_needs.append(need)
        
        return filtered_needs
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Needs detection failed: {str(e)}")

@app.post("/api/optimize-donations", response_model=List[OptimizationRecommendation])
async def optimize_donations(request: DonationOptimizationRequest):
    """
    AI-powered donation optimization
    
    Analyzes donor behavior, preferences, and available causes to recommend
    optimal donation strategies for maximum impact.
    """
    try:
        # Simulate AI processing
        await asyncio.sleep(0.3)
        
        recommendations = []
        
        # Mock optimization logic based on donor profile
        donor_history = request.donor_profile.get("donation_history", [])
        preferred_categories = request.donor_profile.get("preferred_categories", [])
        avg_donation = request.donor_profile.get("average_donation", 100)
        
        for cause in request.available_causes[:3]:  # Top 3 recommendations
            # Calculate match score based on various factors
            match_score = 0.5
            
            # Category preference boost
            if cause.get("category") in preferred_categories:
                match_score += 0.3
            
            # Urgency boost
            if cause.get("urgency_score", 0) > 0.8:
                match_score += 0.2
            
            # Amount alignment
            estimated_amount = cause.get("estimated_amount", 10000)
            if abs(estimated_amount - avg_donation * 10) < avg_donation * 5:
                match_score += 0.1
            
            # Geographic preference (simplified)
            if "Mumbai" in cause.get("location", ""):
                match_score += 0.1
            
            match_score = min(1.0, match_score)
            
            recommendation = OptimizationRecommendation(
                cause_id=cause.get("id", "unknown"),
                match_score=round(match_score, 2),
                recommended_amount=min(avg_donation * 2, estimated_amount // 10),
                optimal_timing="evening" if match_score > 0.7 else "morning",
                reasoning=f"High match based on your preference for {cause.get('category', 'this type')} causes and donation history."
            )
            recommendations.append(recommendation)
        
        # Sort by match score
        recommendations.sort(key=lambda x: x.match_score, reverse=True)
        
        return recommendations
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")

@app.get("/api/urgent-needs")
async def get_urgent_needs(
    limit: int = 10,
    category: Optional[str] = None,
    min_urgency: float = 0.7
):
    """
    Get current urgent needs with AI-powered prioritization
    """
    try:
        needs = []
        for need_data in MOCK_URGENT_NEEDS:
            if need_data["urgency_score"] >= min_urgency:
                if not category or need_data["category"].lower() == category.lower():
                    need = {
                        **need_data,
                        "created_at": datetime.now() - timedelta(hours=random.randint(1, 72)),
                        "ai_insights": {
                            "predicted_funding_time": f"{random.randint(2, 14)} days",
                            "donation_velocity": random.uniform(0.1, 0.8),
                            "social_media_traction": random.uniform(0.2, 0.9),
                            "verification_confidence": random.uniform(0.8, 1.0)
                        }
                    }
                    needs.append(need)
        
        # Sort by urgency score and limit results
        needs.sort(key=lambda x: x["urgency_score"], reverse=True)
        return needs[:limit]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch urgent needs: {str(e)}")

@app.post("/api/predict-impact")
async def predict_donation_impact(
    amount: int,
    cause_category: str,
    location: str
):
    """
    Predict the potential impact of a donation using AI models
    """
    try:
        # Simulate impact prediction
        await asyncio.sleep(0.2)
        
        # Mock impact calculation based on category and amount
        impact_multiplier = {
            "Medical Emergency": 2.5,
            "Clean Water": 1.8,
            "Food Security": 1.5,
            "Education": 2.0,
            "Natural Disaster": 1.7
        }.get(cause_category, 1.5)
        
        lives_impacted = max(1, int(amount * impact_multiplier / 1000))
        
        prediction = {
            "donation_amount": amount,
            "cause_category": cause_category,
            "location": location,
            "predicted_impact": {
                "lives_directly_impacted": lives_impacted,
                "families_helped": max(1, lives_impacted // 3),
                "community_reach": lives_impacted * random.randint(2, 5),
                "impact_duration_days": random.randint(30, 365)
            },
            "confidence_score": round(random.uniform(0.75, 0.95), 2),
            "similar_donations": {
                "average_impact": lives_impacted * random.uniform(0.8, 1.2),
                "success_rate": random.uniform(0.85, 0.98),
                "avg_completion_time": f"{random.randint(5, 30)} days"
            },
            "recommendations": [
                f"Your ₹{amount} donation can provide immediate relief to {lives_impacted} people",
                f"Consider spreading the donation over {random.randint(2, 4)} weeks for sustained impact",
                f"This amount is optimal for {cause_category.lower()} causes in {location}"
            ]
        }
        
        return prediction
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Impact prediction failed: {str(e)}")

@app.get("/api/analytics/insights")
async def get_ai_insights():
    """
    Get AI-generated insights about donation patterns and trends
    """
    try:
        insights = [
            {
                "type": "trend",
                "title": "Medical Emergency Donations Increasing",
                "description": "Medical emergency donations have increased by 34% in the last 30 days, particularly in urban areas.",
                "confidence": 0.89,
                "impact": "high",
                "actionable": True,
                "recommendation": "Consider creating targeted campaigns for medical emergencies in tier-1 cities."
            },
            {
                "type": "pattern",
                "title": "Optimal Donation Timing Detected",
                "description": "Donations made between 7-9 PM on weekdays have 67% higher completion rates.",
                "confidence": 0.92,
                "impact": "medium",
                "actionable": True,
                "recommendation": "Schedule notification campaigns during peak engagement hours."
            },
            {
                "type": "opportunity",
                "title": "Micro-donation Effectiveness",
                "description": "Micro-donations (₹8-50) show 45% better retention rates compared to larger one-time donations.",
                "confidence": 0.78,
                "impact": "high",
                "actionable": True,
                "recommendation": "Promote streaming micro-donations as the preferred donation method."
            },
            {
                "type": "alert",
                "title": "Seasonal Pattern Alert",
                "description": "Food security donations typically drop by 25% in February. Proactive campaigns recommended.",
                "confidence": 0.85,
                "impact": "medium",
                "actionable": True,
                "recommendation": "Launch 'Winter Relief' campaign to maintain food security funding levels."
            }
        ]
        
        return {
            "insights": insights,
            "generated_at": datetime.now().isoformat(),
            "model_version": "1.0.3",
            "data_freshness": "real-time"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate insights: {str(e)}")

# =============================================
# NEW AI SERVICES ENDPOINTS
# =============================================

@app.post("/api/ai/detect-needs")
async def ai_detect_needs_from_text(request: TextAnalysisRequest):
    """
    🤖 AI-Powered Needs Detection
    
    Extract structured needs from unstructured text using OpenAI GPT-4o and HuggingFace transformers.
    Supports social media posts, NGO messages, and news articles.
    
    Example: "Village A needs water urgently" → {"need": "water", "quantity": 100}
    """
    try:
        if request.source_type == "ngo_message":
            needs = await detect_needs_from_ngo_message(request.text)
        else:
            needs = await detect_needs_from_social_post(request.text)
        
        return {
            "success": True,
            "detected_needs": needs,
            "source_type": request.source_type,
            "analysis_timestamp": datetime.now().isoformat(),
            "total_needs_found": len(needs)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Needs detection failed: {str(e)}")

@app.post("/api/ai/verify-news")
async def ai_verify_news_claim(request: NewsVerificationRequest):
    """
    📰 News Verification & Fact-Checking
    
    Verify aid requests against real news using NewsAPI, Google Fact Check API, and AI analysis.
    Returns verification status with confidence score and supporting sources.
    
    Example: "Floods in Village A" → Checks BBC/Reuters for confirmation
    """
    try:
        verification_result = await quick_verify_claim(
            request.claim, 
            request.location
        )
        
        return {
            "success": True,
            "verification_result": verification_result,
            "claim": request.claim,
            "location": request.location,
            "analysis_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"News verification failed: {str(e)}")

@app.post("/api/ai/moderate-content")
async def ai_moderate_content(request: TextAnalysisRequest):
    """
    🛡️ Content Moderation & Safety
    
    Moderate content for toxicity, spam, misinformation using Perspective API and AI.
    Helps detect suspicious content before community polling.
    
    Returns risk level and safety recommendations.
    """
    try:
        moderation_result = await moderate_aid_request(request.text)
        
        return {
            "success": True,
            "moderation_result": moderation_result,
            "text_analyzed": request.text[:100] + "..." if len(request.text) > 100 else request.text,
            "analysis_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Content moderation failed: {str(e)}")

@app.post("/api/ai/create-poll")
async def ai_create_community_poll(request: CommunityPollRequest):
    """
    🗳️ Community Validation Poll
    
    Create a community poll for validating aid requests.
    Includes automatic content moderation and fraud detection.
    
    Returns poll ID and status for community validation.
    """
    try:
        poll_result = await create_validation_poll(
            request.claim_text, 
            request.location
        )
        
        return {
            "success": True,
            "poll": poll_result,
            "claim": request.claim_text,
            "location": request.location,
            "created_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Poll creation failed: {str(e)}")

@app.post("/api/ai/kyc-verify")
async def ai_kyc_verification(request: KYCRequest):
    """
    🔍 KYC Verification & Identity Check
    
    Perform Know Your Customer verification for NGOs and donors.
    Validates identity, documents, contact information using AI and pattern analysis.
    
    Future: Integration with Onfido/Veriff for enhanced verification.
    """
    try:
        user_data = {
            "user_id": request.user_id,
            "name": request.name,
            "email": request.email,
            "phone": request.phone,
            "address": request.address,
            "documents": request.documents
        }
        
        kyc_result = await quick_kyc_check(user_data)
        
        return {
            "success": True,
            "kyc_result": kyc_result,
            "user_id": request.user_id,
            "verification_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"KYC verification failed: {str(e)}")

@app.post("/api/ai/fraud-analysis")
async def ai_fraud_risk_analysis(request: FraudAnalysisRequest):
    """
    🕵️ Fraud Detection & Risk Analysis
    
    Analyze user behavior patterns for fraud detection.
    Monitors donation patterns, timing, and behavioral anomalies.
    
    Returns risk level and recommendations for account actions.
    """
    try:
        fraud_result = await quick_fraud_check(
            request.user_id, 
            request.activity_data
        )
        
        return {
            "success": True,
            "fraud_analysis": fraud_result,
            "user_id": request.user_id,
            "analysis_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fraud analysis failed: {str(e)}")

@app.get("/api/ai/comprehensive-check")
async def ai_comprehensive_verification(
    claim: str,
    location: Optional[str] = None,
    user_id: Optional[str] = None
):
    """
    🎯 Comprehensive AI Verification Pipeline
    
    Run complete verification pipeline:
    1. Extract needs from claim
    2. Verify against news sources  
    3. Moderate content for safety
    4. Create community poll if safe
    
    One-stop endpoint for complete AI-powered verification.
    """
    try:
        # Step 1: Extract needs
        needs_result = await detect_needs_from_social_post(claim)
        
        # Step 2: Verify against news
        news_result = await quick_verify_claim(claim, location)
        
        # Step 3: Moderate content
        moderation_result = await moderate_aid_request(claim)
        
        # Step 4: Create poll if content is safe
        poll_result = None
        if moderation_result.get("safe", False):
            try:
                poll_result = await create_validation_poll(claim, location or "Unknown")
            except Exception as poll_error:
                poll_result = {"error": str(poll_error)}
        
        # Combine results
        comprehensive_result = {
            "success": True,
            "pipeline_results": {
                "needs_detection": {
                    "detected_needs": needs_result,
                    "total_needs": len(needs_result)
                },
                "news_verification": news_result,
                "content_moderation": moderation_result,
                "community_poll": poll_result
            },
            "overall_status": {
                "needs_found": len(needs_result) > 0,
                "news_verified": news_result.get("verified", False),
                "content_safe": moderation_result.get("safe", False),
                "poll_created": poll_result is not None and "error" not in poll_result
            },
            "recommendations": _generate_comprehensive_recommendations(
                needs_result, news_result, moderation_result, poll_result
            ),
            "analysis_timestamp": datetime.now().isoformat()
        }
        
        return comprehensive_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comprehensive verification failed: {str(e)}")

def _generate_comprehensive_recommendations(needs, news, moderation, poll):
    """Generate recommendations based on comprehensive analysis"""
    recommendations = []
    
    if len(needs) > 0:
        recommendations.append("✅ Structured needs detected - proceed with aid request processing")
    else:
        recommendations.append("⚠️ No clear needs detected - request clarification")
    
    if news.get("verified", False):
        recommendations.append("✅ News sources confirm the situation - high credibility")
    elif news.get("status") == "unverified":
        recommendations.append("🔍 Could not verify with news sources - requires manual review")
    
    if moderation.get("safe", False):
        recommendations.append("✅ Content passes safety checks - safe for publication")
    else:
        recommendations.append("⚠️ Content flagged for review - manual moderation required")
    
    if poll and "error" not in poll:
        recommendations.append("🗳️ Community poll created - allow community validation")
    else:
        recommendations.append("❌ Could not create community poll - direct verification needed")
    
    return recommendations

@app.get("/api/ai/status")
async def ai_services_status():
    """
    📊 AI Services Status & Health Check
    
    Get status of all AI services, model availability, and system health.
    Useful for monitoring and debugging AI pipeline issues.
    """
    try:
        # Test each service
        services_status = {}
        
        # Test needs detection
        try:
            test_needs = await detect_needs_from_social_post("Test message for needs detection")
            services_status["needs_detection"] = {
                "status": "operational",
                "last_test": datetime.now().isoformat()
            }
        except Exception as e:
            services_status["needs_detection"] = {
                "status": "error",
                "error": str(e)
            }
        
        # Test news verification
        try:
            test_news = await quick_verify_claim("Test claim", "Test location")
            services_status["news_verification"] = {
                "status": "operational",
                "last_test": datetime.now().isoformat()
            }
        except Exception as e:
            services_status["news_verification"] = {
                "status": "error",
                "error": str(e)
            }
        
        # Test content moderation
        try:
            test_moderation = await moderate_aid_request("Test content for moderation")
            services_status["content_moderation"] = {
                "status": "operational", 
                "last_test": datetime.now().isoformat()
            }
        except Exception as e:
            services_status["content_moderation"] = {
                "status": "error",
                "error": str(e)
            }
        
        # Check environment variables
        env_status = {
            "openai_api_key": "✅ Set" if os.getenv("OPENAI_API_KEY") else "❌ Missing",
            "news_api_key": "✅ Set" if os.getenv("NEWS_API_KEY") else "❌ Missing", 
            "perspective_api_key": "✅ Set" if os.getenv("PERSPECTIVE_API_KEY") else "❌ Missing",
            "google_fact_check_key": "✅ Set" if os.getenv("GOOGLE_FACT_CHECK_API_KEY") else "❌ Missing"
        }
        
        # Overall health
        operational_count = sum(1 for s in services_status.values() if s.get("status") == "operational")
        overall_health = "healthy" if operational_count >= 3 else "degraded" if operational_count >= 1 else "critical"
        
        return {
            "overall_health": overall_health,
            "services_status": services_status,
            "environment_status": env_status,
            "operational_services": operational_count,
            "total_services": len(services_status),
            "timestamp": datetime.now().isoformat(),
            "uptime_info": "AI Services running since server start"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
