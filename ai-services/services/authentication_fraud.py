"""
Authentication & Fraud Prevention Service
Advanced KYC, behavioral analysis, and fraud detection for NGOs and donors
"""

import os
import json
import asyncio
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import hashlib
import re

# Utilities
import httpx
import requests
from urllib.parse import quote_plus

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VerificationLevel(Enum):
    UNVERIFIED = "unverified"
    BASIC = "basic"
    VERIFIED = "verified"
    PREMIUM = "premium"
    TRUSTED = "trusted"

class FraudRisk(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class KYCResult:
    """Result of KYC verification process"""
    verification_level: VerificationLevel
    identity_verified: bool
    document_verified: bool
    address_verified: bool
    phone_verified: bool
    email_verified: bool
    biometric_verified: bool
    risk_score: float
    verification_details: Dict[str, Any]
    expiry_date: datetime
    verification_provider: str

@dataclass
class FraudAnalysis:
    """Fraud risk analysis result"""
    risk_level: FraudRisk
    fraud_score: float
    behavioral_flags: List[str]
    pattern_anomalies: List[str]
    recommendation: str
    confidence: float
    analysis_details: Dict[str, Any]

@dataclass
class UserProfile:
    """Comprehensive user profile for fraud detection"""
    user_id: str
    user_type: str  # "donor", "ngo", "beneficiary"
    registration_date: datetime
    kyc_result: Optional[KYCResult]
    fraud_analysis: Optional[FraudAnalysis]
    donation_history: List[Dict[str, Any]]
    behavioral_patterns: Dict[str, Any]
    trust_score: float
    verification_history: List[Dict[str, Any]]

class AuthenticationFraudAI:
    """
    Main class for authentication and fraud prevention
    """
    
    def __init__(self):
        self.onfido_api_key = os.getenv("ONFIDO_API_KEY")
        self.veriff_api_key = os.getenv("VERIFF_API_KEY")
        self.user_profiles: Dict[str, UserProfile] = {}
        self.fraud_patterns: Dict[str, List[str]] = self._initialize_fraud_patterns()
        self._initialize_services()
    
    def _initialize_services(self):
        """Initialize KYC and verification services"""
        try:
            if self.onfido_api_key:
                logger.info("✅ Onfido KYC service initialized")
            else:
                logger.warning("⚠️ ONFIDO_API_KEY not found")
            
            if self.veriff_api_key:
                logger.info("✅ Veriff KYC service initialized")
            else:
                logger.warning("⚠️ VERIFF_API_KEY not found")
                
        except Exception as e:
            logger.error(f"❌ Authentication service initialization failed: {e}")
    
    def _initialize_fraud_patterns(self) -> Dict[str, List[str]]:
        """Initialize known fraud patterns"""
        return {
            "suspicious_names": [
                r"^test\s*\d*$",
                r"^fake\s*\d*$",
                r"^admin\s*\d*$",
                r"^user\s*\d*$",
                r"^asdf+$",
                r"^qwerty+$"
            ],
            "suspicious_emails": [
                r".*temp.*mail.*",
                r".*10minute.*mail.*",
                r".*guerrillamail.*",
                r".*mailinator.*",
                r".*trashmail.*",
                r".*spam.*"
            ],
            "suspicious_phones": [
                r"^(\d)\1{9,}$",  # Repeated digits
                r"^123456789\d*$",
                r"^987654321\d*$",
                r"^000000000\d*$"
            ],
            "suspicious_addresses": [
                r".*test.*address.*",
                r".*fake.*street.*",
                r".*123.*main.*street.*",
                r".*nowhere.*"
            ]
        }
    
    async def perform_kyc_verification(
        self, 
        user_id: str,
        user_data: Dict[str, Any],
        verification_level: str = "basic"
    ) -> KYCResult:
        """
        Perform KYC verification for a user
        
        Args:
            user_id: Unique user identifier
            user_data: User information (name, email, phone, documents, etc.)
            verification_level: "basic", "standard", or "enhanced"
            
        Returns:
            KYCResult with verification status
        """
        try:
            logger.info(f"🔍 Starting KYC verification for user {user_id}")
            
            # Initialize verification result
            kyc_result = KYCResult(
                verification_level=VerificationLevel.UNVERIFIED,
                identity_verified=False,
                document_verified=False,
                address_verified=False,
                phone_verified=False,
                email_verified=False,
                biometric_verified=False,
                risk_score=0.5,
                verification_details={},
                expiry_date=datetime.now() + timedelta(days=365),
                verification_provider="sevastream_internal"
            )
            
            # Run verification checks
            verification_tasks = [
                self._verify_identity(user_data),
                self._verify_email(user_data.get("email")),
                self._verify_phone(user_data.get("phone")),
                self._verify_address(user_data.get("address")),
                self._check_document_authenticity(user_data.get("documents", []))
            ]
            
            results = await asyncio.gather(*verification_tasks, return_exceptions=True)
            
            # Process results
            identity_result = results[0] if not isinstance(results[0], Exception) else {"verified": False}
            email_result = results[1] if not isinstance(results[1], Exception) else {"verified": False}
            phone_result = results[2] if not isinstance(results[2], Exception) else {"verified": False}
            address_result = results[3] if not isinstance(results[3], Exception) else {"verified": False}
            document_result = results[4] if not isinstance(results[4], Exception) else {"verified": False}
            
            # Update KYC result
            kyc_result.identity_verified = identity_result.get("verified", False)
            kyc_result.email_verified = email_result.get("verified", False)
            kyc_result.phone_verified = phone_result.get("verified", False)
            kyc_result.address_verified = address_result.get("verified", False)
            kyc_result.document_verified = document_result.get("verified", False)
            
            # Calculate overall verification level
            kyc_result.verification_level = self._calculate_verification_level(kyc_result)
            
            # Calculate risk score
            kyc_result.risk_score = self._calculate_kyc_risk_score(kyc_result, user_data)
            
            # Store verification details
            kyc_result.verification_details = {
                "identity_check": identity_result,
                "email_check": email_result,
                "phone_check": phone_result,
                "address_check": address_result,
                "document_check": document_result,
                "verification_timestamp": datetime.now().isoformat(),
                "verification_method": verification_level
            }
            
            logger.info(f"✅ KYC verification completed: {kyc_result.verification_level.value}")
            return kyc_result
            
        except Exception as e:
            logger.error(f"❌ KYC verification failed: {e}")
            # Return minimal verification result on error
            return KYCResult(
                verification_level=VerificationLevel.UNVERIFIED,
                identity_verified=False,
                document_verified=False,
                address_verified=False,
                phone_verified=False,
                email_verified=False,
                biometric_verified=False,
                risk_score=0.8,  # High risk on verification failure
                verification_details={"error": str(e)},
                expiry_date=datetime.now() + timedelta(days=30),
                verification_provider="sevastream_internal"
            )
    
    async def _verify_identity(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Verify user identity using multiple checks"""
        try:
            name = user_data.get("name", "").strip()
            
            if not name:
                return {"verified": False, "reason": "No name provided"}
            
            # Check against suspicious name patterns
            name_lower = name.lower()
            for pattern in self.fraud_patterns["suspicious_names"]:
                if re.match(pattern, name_lower):
                    return {"verified": False, "reason": "Suspicious name pattern"}
            
            # Basic name validation
            if len(name) < 2:
                return {"verified": False, "reason": "Name too short"}
            
            if not re.match(r"^[a-zA-Z\s\.\-']+$", name):
                return {"verified": False, "reason": "Invalid characters in name"}
            
            # Check for minimum realistic name structure
            name_parts = name.split()
            if len(name_parts) < 2:
                return {"verified": False, "reason": "Name should have at least first and last name"}
            
            return {
                "verified": True,
                "name_parts": len(name_parts),
                "validation_method": "pattern_matching"
            }
            
        except Exception as e:
            return {"verified": False, "error": str(e)}
    
    async def _verify_email(self, email: Optional[str]) -> Dict[str, Any]:
        """Verify email address"""
        try:
            if not email:
                return {"verified": False, "reason": "No email provided"}
            
            # Basic email format validation
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, email):
                return {"verified": False, "reason": "Invalid email format"}
            
            # Check against suspicious email patterns
            email_lower = email.lower()
            for pattern in self.fraud_patterns["suspicious_emails"]:
                if re.search(pattern, email_lower):
                    return {"verified": False, "reason": "Suspicious email provider"}
            
            # Check for disposable email providers
            disposable_domains = [
                "tempmail.org", "10minutemail.com", "guerrillamail.com",
                "mailinator.com", "trashmail.com", "yopmail.com"
            ]
            
            domain = email.split('@')[1].lower()
            if domain in disposable_domains:
                return {"verified": False, "reason": "Disposable email provider"}
            
            # TODO: In production, send verification email and check response
            # For now, return verified if it passes basic checks
            return {
                "verified": True,
                "domain": domain,
                "validation_method": "format_and_pattern_check"
            }
            
        except Exception as e:
            return {"verified": False, "error": str(e)}
    
    async def _verify_phone(self, phone: Optional[str]) -> Dict[str, Any]:
        """Verify phone number"""
        try:
            if not phone:
                return {"verified": False, "reason": "No phone provided"}
            
            # Clean phone number
            cleaned_phone = re.sub(r'[^\d+]', '', phone)
            
            # Basic phone validation
            if len(cleaned_phone) < 10 or len(cleaned_phone) > 15:
                return {"verified": False, "reason": "Invalid phone length"}
            
            # Check against suspicious phone patterns
            for pattern in self.fraud_patterns["suspicious_phones"]:
                if re.match(pattern, cleaned_phone):
                    return {"verified": False, "reason": "Suspicious phone pattern"}
            
            # Basic Indian phone number validation
            if cleaned_phone.startswith('+91'):
                indian_number = cleaned_phone[3:]
                if len(indian_number) == 10 and indian_number[0] in '6789':
                    return {
                        "verified": True,
                        "country": "India",
                        "validation_method": "format_check"
                    }
            
            # International format validation
            if cleaned_phone.startswith('+') and len(cleaned_phone) >= 11:
                return {
                    "verified": True,
                    "country": "International",
                    "validation_method": "format_check"
                }
            
            return {"verified": False, "reason": "Invalid phone format"}
            
        except Exception as e:
            return {"verified": False, "error": str(e)}
    
    async def _verify_address(self, address: Optional[str]) -> Dict[str, Any]:
        """Verify address information"""
        try:
            if not address:
                return {"verified": False, "reason": "No address provided"}
            
            address_lower = address.lower()
            
            # Check against suspicious address patterns
            for pattern in self.fraud_patterns["suspicious_addresses"]:
                if re.search(pattern, address_lower):
                    return {"verified": False, "reason": "Suspicious address pattern"}
            
            # Basic address validation
            if len(address.strip()) < 10:
                return {"verified": False, "reason": "Address too short"}
            
            # Check for common address components
            has_number = bool(re.search(r'\d+', address))
            has_street_indicator = bool(re.search(r'\b(street|road|avenue|lane|plot|house)\b', address_lower))
            
            if not (has_number or has_street_indicator):
                return {"verified": False, "reason": "Address lacks basic components"}
            
            return {
                "verified": True,
                "has_number": has_number,
                "has_street_indicator": has_street_indicator,
                "validation_method": "pattern_check"
            }
            
        except Exception as e:
            return {"verified": False, "error": str(e)}
    
    async def _check_document_authenticity(self, documents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Check document authenticity using AI and pattern recognition"""
        try:
            if not documents:
                return {"verified": False, "reason": "No documents provided"}
            
            verified_docs = []
            suspicious_flags = []
            
            for doc in documents:
                doc_type = doc.get("type", "").lower()
                doc_data = doc.get("data", "")  # Base64 encoded or file path
                
                # Basic document type validation
                valid_doc_types = [
                    "passport", "driving_license", "aadhaar", "pan_card", 
                    "voter_id", "utility_bill", "bank_statement"
                ]
                
                if doc_type not in valid_doc_types:
                    suspicious_flags.append(f"Invalid document type: {doc_type}")
                    continue
                
                # TODO: In production, use actual document verification APIs
                # For now, perform basic validation
                if doc_data and len(doc_data) > 100:  # Assume valid if data exists
                    verified_docs.append(doc_type)
                else:
                    suspicious_flags.append(f"Invalid document data for {doc_type}")
            
            verification_status = len(verified_docs) > 0 and len(suspicious_flags) == 0
            
            return {
                "verified": verification_status,
                "verified_documents": verified_docs,
                "suspicious_flags": suspicious_flags,
                "total_documents": len(documents),
                "validation_method": "basic_check"
            }
            
        except Exception as e:
            return {"verified": False, "error": str(e)}
    
    def _calculate_verification_level(self, kyc_result: KYCResult) -> VerificationLevel:
        """Calculate overall verification level based on completed checks"""
        verified_checks = sum([
            kyc_result.identity_verified,
            kyc_result.email_verified,
            kyc_result.phone_verified,
            kyc_result.address_verified,
            kyc_result.document_verified
        ])
        
        if verified_checks >= 4:
            return VerificationLevel.PREMIUM
        elif verified_checks >= 3:
            return VerificationLevel.VERIFIED
        elif verified_checks >= 2:
            return VerificationLevel.BASIC
        else:
            return VerificationLevel.UNVERIFIED
    
    def _calculate_kyc_risk_score(self, kyc_result: KYCResult, user_data: Dict[str, Any]) -> float:
        """Calculate risk score based on verification results"""
        base_score = 0.5  # Neutral starting point
        
        # Reduce risk for verified components
        if kyc_result.identity_verified:
            base_score -= 0.1
        if kyc_result.email_verified:
            base_score -= 0.1
        if kyc_result.phone_verified:
            base_score -= 0.1
        if kyc_result.address_verified:
            base_score -= 0.1
        if kyc_result.document_verified:
            base_score -= 0.15
        
        # Account age factor (if available)
        registration_date = user_data.get("registration_date")
        if registration_date:
            try:
                reg_date = datetime.fromisoformat(registration_date)
                account_age_days = (datetime.now() - reg_date).days
                if account_age_days > 30:
                    base_score -= 0.05
                elif account_age_days < 1:
                    base_score += 0.1  # Very new accounts are riskier
            except:
                pass
        
        return max(0.0, min(1.0, base_score))
    
    async def analyze_fraud_risk(
        self, 
        user_id: str,
        activity_data: Dict[str, Any],
        historical_behavior: Optional[Dict[str, Any]] = None
    ) -> FraudAnalysis:
        """
        Analyze fraud risk based on user behavior and patterns
        
        Args:
            user_id: User identifier
            activity_data: Current activity/transaction data
            historical_behavior: User's historical behavior patterns
            
        Returns:
            FraudAnalysis with risk assessment
        """
        try:
            logger.info(f"🕵️ Analyzing fraud risk for user {user_id}")
            
            fraud_score = 0.0
            behavioral_flags = []
            pattern_anomalies = []
            
            # Analyze current activity
            activity_risk = await self._analyze_activity_patterns(activity_data)
            fraud_score += activity_risk["score"]
            behavioral_flags.extend(activity_risk["flags"])
            
            # Analyze historical patterns if available
            if historical_behavior:
                pattern_risk = await self._analyze_historical_patterns(
                    activity_data, historical_behavior
                )
                fraud_score += pattern_risk["score"]
                pattern_anomalies.extend(pattern_risk["anomalies"])
            
            # Analyze transaction patterns
            transaction_risk = await self._analyze_transaction_patterns(activity_data)
            fraud_score += transaction_risk["score"]
            behavioral_flags.extend(transaction_risk["flags"])
            
            # Normalize fraud score
            fraud_score = min(1.0, fraud_score)
            
            # Determine risk level
            risk_level = self._calculate_fraud_risk_level(fraud_score)
            
            # Generate recommendation
            recommendation = self._generate_fraud_recommendation(risk_level, behavioral_flags)
            
            # Calculate confidence
            confidence = self._calculate_fraud_confidence(
                len(behavioral_flags), len(pattern_anomalies), fraud_score
            )
            
            return FraudAnalysis(
                risk_level=risk_level,
                fraud_score=fraud_score,
                behavioral_flags=behavioral_flags,
                pattern_anomalies=pattern_anomalies,
                recommendation=recommendation,
                confidence=confidence,
                analysis_details={
                    "activity_risk": activity_risk,
                    "pattern_risk": pattern_risk if historical_behavior else {},
                    "transaction_risk": transaction_risk,
                    "analysis_timestamp": datetime.now().isoformat()
                }
            )
            
        except Exception as e:
            logger.error(f"❌ Fraud analysis failed: {e}")
            return FraudAnalysis(
                risk_level=FraudRisk.MEDIUM,
                fraud_score=0.5,
                behavioral_flags=["analysis_error"],
                pattern_anomalies=[],
                recommendation="Manual review required due to analysis error",
                confidence=0.3,
                analysis_details={"error": str(e)}
            )
    
    async def _analyze_activity_patterns(self, activity_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze current activity for suspicious patterns"""
        score = 0.0
        flags = []
        
        try:
            # Check donation frequency
            donation_count = activity_data.get("donation_count_24h", 0)
            if donation_count > 10:
                score += 0.3
                flags.append("high_frequency_donations")
            
            # Check donation amounts
            donation_amounts = activity_data.get("donation_amounts", [])
            if donation_amounts:
                avg_amount = sum(donation_amounts) / len(donation_amounts)
                if avg_amount > 50000:  # Very high amounts
                    score += 0.2
                    flags.append("unusually_high_amounts")
                
                # Check for round number preference (fraud indicator)
                round_numbers = [amt for amt in donation_amounts if amt % 1000 == 0]
                if len(round_numbers) / len(donation_amounts) > 0.8:
                    score += 0.1
                    flags.append("preference_for_round_numbers")
            
            # Check time patterns
            activity_times = activity_data.get("activity_timestamps", [])
            if activity_times:
                # Check for bot-like regular intervals
                if len(activity_times) > 3:
                    intervals = []
                    for i in range(1, len(activity_times)):
                        try:
                            prev_time = datetime.fromisoformat(activity_times[i-1])
                            curr_time = datetime.fromisoformat(activity_times[i])
                            interval = (curr_time - prev_time).total_seconds()
                            intervals.append(interval)
                        except:
                            continue
                    
                    if intervals:
                        # Check for suspiciously regular intervals
                        avg_interval = sum(intervals) / len(intervals)
                        variance = sum((i - avg_interval) ** 2 for i in intervals) / len(intervals)
                        if variance < 10:  # Very low variance = bot-like
                            score += 0.3
                            flags.append("bot_like_timing_patterns")
            
            # Check IP/location patterns
            ip_addresses = activity_data.get("ip_addresses", [])
            if len(set(ip_addresses)) > 5:  # Many different IPs
                score += 0.2
                flags.append("multiple_ip_addresses")
            
            # Check device fingerprints
            devices = activity_data.get("device_fingerprints", [])
            if len(set(devices)) > 3:  # Many different devices
                score += 0.15
                flags.append("multiple_devices")
            
        except Exception as e:
            logger.warning(f"Activity pattern analysis error: {e}")
            flags.append("activity_analysis_error")
        
        return {"score": score, "flags": flags}
    
    async def _analyze_historical_patterns(
        self, 
        current_activity: Dict[str, Any], 
        historical_behavior: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze deviations from historical behavior patterns"""
        score = 0.0
        anomalies = []
        
        try:
            # Compare donation frequency
            current_freq = current_activity.get("donation_count_24h", 0)
            historical_freq = historical_behavior.get("avg_donations_per_day", 1)
            
            if current_freq > historical_freq * 5:  # 5x normal frequency
                score += 0.3
                anomalies.append("unusual_donation_frequency_spike")
            
            # Compare average donation amounts
            current_amounts = current_activity.get("donation_amounts", [])
            historical_avg = historical_behavior.get("avg_donation_amount", 100)
            
            if current_amounts:
                current_avg = sum(current_amounts) / len(current_amounts)
                if current_avg > historical_avg * 10:  # 10x normal amount
                    score += 0.4
                    anomalies.append("unusual_donation_amount_spike")
                elif current_avg < historical_avg * 0.1:  # Much smaller amounts
                    score += 0.1
                    anomalies.append("unusual_donation_amount_drop")
            
            # Compare time patterns
            current_hours = current_activity.get("activity_hours", [])
            historical_hours = historical_behavior.get("typical_activity_hours", [])
            
            if current_hours and historical_hours:
                overlap = set(current_hours) & set(historical_hours)
                if len(overlap) / len(set(current_hours)) < 0.3:  # < 30% overlap
                    score += 0.2
                    anomalies.append("unusual_activity_timing")
            
        except Exception as e:
            logger.warning(f"Historical pattern analysis error: {e}")
            anomalies.append("historical_analysis_error")
        
        return {"score": score, "anomalies": anomalies}
    
    async def _analyze_transaction_patterns(self, activity_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze transaction patterns for fraud indicators"""
        score = 0.0
        flags = []
        
        try:
            transactions = activity_data.get("transactions", [])
            
            if not transactions:
                return {"score": 0.0, "flags": []}
            
            # Check for failed transaction patterns
            failed_count = sum(1 for tx in transactions if tx.get("status") == "failed")
            failure_rate = failed_count / len(transactions)
            
            if failure_rate > 0.5:  # > 50% failure rate
                score += 0.3
                flags.append("high_transaction_failure_rate")
            
            # Check for quick succession transactions
            timestamps = [tx.get("timestamp") for tx in transactions if tx.get("timestamp")]
            if len(timestamps) > 1:
                quick_succession = 0
                for i in range(1, len(timestamps)):
                    try:
                        prev_time = datetime.fromisoformat(timestamps[i-1])
                        curr_time = datetime.fromisoformat(timestamps[i])
                        if (curr_time - prev_time).total_seconds() < 5:  # < 5 seconds
                            quick_succession += 1
                    except:
                        continue
                
                if quick_succession > 3:
                    score += 0.2
                    flags.append("rapid_fire_transactions")
            
            # Check for unusual beneficiary patterns
            beneficiaries = [tx.get("beneficiary_id") for tx in transactions if tx.get("beneficiary_id")]
            unique_beneficiaries = len(set(beneficiaries))
            
            if len(beneficiaries) > 0:
                beneficiary_diversity = unique_beneficiaries / len(beneficiaries)
                if beneficiary_diversity < 0.2:  # Donating to very few beneficiaries
                    score += 0.1
                    flags.append("low_beneficiary_diversity")
            
        except Exception as e:
            logger.warning(f"Transaction pattern analysis error: {e}")
            flags.append("transaction_analysis_error")
        
        return {"score": score, "flags": flags}
    
    def _calculate_fraud_risk_level(self, fraud_score: float) -> FraudRisk:
        """Calculate fraud risk level from score"""
        if fraud_score >= 0.8:
            return FraudRisk.CRITICAL
        elif fraud_score >= 0.6:
            return FraudRisk.HIGH
        elif fraud_score >= 0.3:
            return FraudRisk.MEDIUM
        else:
            return FraudRisk.LOW
    
    def _generate_fraud_recommendation(self, risk_level: FraudRisk, flags: List[str]) -> str:
        """Generate fraud prevention recommendation"""
        if risk_level == FraudRisk.CRITICAL:
            return "BLOCK: Suspend account immediately and require manual verification"
        elif risk_level == FraudRisk.HIGH:
            return "RESTRICT: Limit transaction amounts and require additional verification"
        elif risk_level == FraudRisk.MEDIUM:
            return "MONITOR: Enable enhanced monitoring and alerts for suspicious activity"
        else:
            return "ALLOW: Normal processing with standard monitoring"
    
    def _calculate_fraud_confidence(
        self, 
        flag_count: int, 
        anomaly_count: int, 
        fraud_score: float
    ) -> float:
        """Calculate confidence in fraud analysis"""
        # Base confidence on amount of evidence
        evidence_score = (flag_count + anomaly_count) / 10.0  # Normalize to 0-1
        
        # Factor in fraud score magnitude
        score_confidence = abs(fraud_score - 0.5) * 2  # Distance from neutral
        
        # Combine factors
        confidence = (evidence_score + score_confidence) / 2
        
        return min(1.0, max(0.3, confidence))  # Ensure reasonable bounds

# Utility functions for external use
async def quick_kyc_check(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Quick KYC verification for API endpoints
    Returns simplified verification result
    """
    auth_service = AuthenticationFraudAI()
    
    result = await auth_service.perform_kyc_verification(
        user_id=user_data.get("user_id", "unknown"),
        user_data=user_data,
        verification_level="basic"
    )
    
    return {
        "verified": result.verification_level != VerificationLevel.UNVERIFIED,
        "verification_level": result.verification_level.value,
        "risk_score": result.risk_score,
        "verified_components": {
            "identity": result.identity_verified,
            "email": result.email_verified,
            "phone": result.phone_verified,
            "address": result.address_verified,
            "documents": result.document_verified
        }
    }

async def quick_fraud_check(user_id: str, activity_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Quick fraud risk assessment
    Returns simplified fraud analysis
    """
    auth_service = AuthenticationFraudAI()
    
    result = await auth_service.analyze_fraud_risk(user_id, activity_data)
    
    return {
        "safe": result.risk_level in [FraudRisk.LOW, FraudRisk.MEDIUM],
        "risk_level": result.risk_level.value,
        "fraud_score": result.fraud_score,
        "recommendation": result.recommendation,
        "confidence": result.confidence
    }

# Test function
async def test_authentication_fraud():
    """Test the authentication and fraud detection system"""
    
    # Test KYC verification
    test_user_data = {
        "user_id": "test_user_001",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+911234567890",
        "address": "123 Main Street, Mumbai, Maharashtra",
        "documents": [
            {"type": "aadhaar", "data": "mock_aadhaar_data"},
            {"type": "pan_card", "data": "mock_pan_data"}
        ]
    }
    
    print("🧪 Testing KYC Verification...")
    kyc_result = await quick_kyc_check(test_user_data)
    print(f"  ✅ Verified: {kyc_result['verified']}")
    print(f"  📊 Level: {kyc_result['verification_level']}")
    print(f"  ⚠️ Risk Score: {kyc_result['risk_score']:.2f}")
    
    # Test fraud detection
    test_activity = {
        "donation_count_24h": 15,  # High frequency
        "donation_amounts": [1000, 2000, 1000, 5000],  # Round numbers
        "activity_timestamps": [
            "2025-08-30T10:00:00",
            "2025-08-30T10:01:00",  # Very quick succession
            "2025-08-30T10:02:00"
        ]
    }
    
    print("\n🧪 Testing Fraud Detection...")
    fraud_result = await quick_fraud_check("test_user_001", test_activity)
    print(f"  ✅ Safe: {fraud_result['safe']}")
    print(f"  ⚠️ Risk Level: {fraud_result['risk_level']}")
    print(f"  📊 Fraud Score: {fraud_result['fraud_score']:.2f}")
    print(f"  💡 Recommendation: {fraud_result['recommendation']}")

if __name__ == "__main__":
    # Run test when executed directly
    asyncio.run(test_authentication_fraud())
