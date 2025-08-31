import { useState, useCallback } from 'react';

const AI_SERVICE_BASE_URL = 'http://localhost:8002';

interface NeedsDetectionRequest {
  text: string;
  source_type?: 'social_media' | 'ngo_message' | 'news';
}

interface NewsVerificationRequest {
  claim: string;
  location?: string;
  incident_type?: string;
}

interface ContentModerationRequest {
  text: string;
  source_type?: string;
}

interface CommunityPollRequest {
  claim_text: string;
  location: string;
  duration_hours?: number;
}

interface KYCRequest {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  documents?: any[];
}

interface FraudAnalysisRequest {
  user_id: string;
  activity_data: any;
  historical_behavior?: any;
}

interface UseAIServicesReturn {
  // State
  loading: boolean;
  error: string | null;
  
  // Core AI Functions
  detectNeeds: (request: NeedsDetectionRequest) => Promise<any>;
  verifyNews: (request: NewsVerificationRequest) => Promise<any>;
  moderateContent: (request: ContentModerationRequest) => Promise<any>;
  createPoll: (request: CommunityPollRequest) => Promise<any>;
  verifyKYC: (request: KYCRequest) => Promise<any>;
  analyzeFraud: (request: FraudAnalysisRequest) => Promise<any>;
  
  // Convenience Functions
  comprehensiveCheck: (claim: string, location?: string) => Promise<any>;
  checkServiceStatus: () => Promise<any>;
  
  // Utility Functions
  clearError: () => void;
}

export const useAIServices = (): UseAIServicesReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeAPICall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${AI_SERVICE_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API call failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔍 Needs Detection - Extract structured needs from text
  const detectNeeds = useCallback(async (request: NeedsDetectionRequest) => {
    return makeAPICall('/api/ai/detect-needs', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }, [makeAPICall]);

  // 📰 News Verification - Verify claims against news sources
  const verifyNews = useCallback(async (request: NewsVerificationRequest) => {
    return makeAPICall('/api/ai/verify-news', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }, [makeAPICall]);

  // 🛡️ Content Moderation - Check content safety
  const moderateContent = useCallback(async (request: ContentModerationRequest) => {
    return makeAPICall('/api/ai/moderate-content', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }, [makeAPICall]);

  // 🗳️ Community Poll - Create validation poll
  const createPoll = useCallback(async (request: CommunityPollRequest) => {
    return makeAPICall('/api/ai/create-poll', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }, [makeAPICall]);

  // 🔐 KYC Verification - Verify user identity
  const verifyKYC = useCallback(async (request: KYCRequest) => {
    return makeAPICall('/api/ai/kyc-verify', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }, [makeAPICall]);

  // 🕵️ Fraud Analysis - Analyze user behavior for fraud
  const analyzeFraud = useCallback(async (request: FraudAnalysisRequest) => {
    return makeAPICall('/api/ai/fraud-analysis', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }, [makeAPICall]);

  // 🎯 Comprehensive Check - Run complete AI verification pipeline
  const comprehensiveCheck = useCallback(async (claim: string, location?: string) => {
    const params = new URLSearchParams({ claim });
    if (location) params.append('location', location);
    
    return makeAPICall(`/api/ai/comprehensive-check?${params.toString()}`);
  }, [makeAPICall]);

  // 📊 Service Status - Check AI services health
  const checkServiceStatus = useCallback(async () => {
    return makeAPICall('/api/ai/status');
  }, [makeAPICall]);

  // 🧹 Clear Error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    
    // Core AI Functions
    detectNeeds,
    verifyNews,
    moderateContent,
    createPoll,
    verifyKYC,
    analyzeFraud,
    
    // Convenience Functions
    comprehensiveCheck,
    checkServiceStatus,
    
    // Utility Functions
    clearError,
  };
};

// 🎯 Convenience hooks for specific use cases

// Hook for donation verification workflow
export const useDonationVerification = () => {
  const { detectNeeds, verifyNews, moderateContent, comprehensiveCheck, loading, error } = useAIServices();
  
  const verifyDonationRequest = useCallback(async (
    donationText: string, 
    location?: string,
    sourceType: 'social_media' | 'ngo_message' = 'social_media'
  ) => {
    // Run comprehensive check for donation requests
    const result = await comprehensiveCheck(donationText, location);
    
    return {
      isVerified: result.pipeline_results?.news_verification?.verified || false,
      isSafe: result.pipeline_results?.content_moderation?.safe || false,
      hasNeeds: (result.pipeline_results?.needs_detection?.total_needs || 0) > 0,
      confidence: result.pipeline_results?.news_verification?.confidence || 0,
      recommendations: result.recommendations || [],
      fullResult: result
    };
  }, [comprehensiveCheck]);

  return {
    verifyDonationRequest,
    detectNeeds,
    verifyNews,
    moderateContent,
    loading,
    error
  };
};

// Hook for user verification workflow  
export const useUserVerification = () => {
  const { verifyKYC, analyzeFraud, loading, error } = useAIServices();
  
  const verifyUser = useCallback(async (userData: {
    user_id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
    documents?: any[];
    activityData?: any;
  }) => {
    // Run KYC verification
    const kycResult = await verifyKYC({
      user_id: userData.user_id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
      documents: userData.documents || []
    });

    // Run fraud analysis if activity data available
    let fraudResult = null;
    if (userData.activityData) {
      fraudResult = await analyzeFraud({
        user_id: userData.user_id,
        activity_data: userData.activityData
      });
    }

    return {
      isVerified: kycResult.kyc_result?.verified || false,
      verificationLevel: kycResult.kyc_result?.verification_level || 'unverified',
      isSafe: fraudResult?.fraud_analysis?.safe !== false, // Default to safe if no fraud check
      riskLevel: fraudResult?.fraud_analysis?.risk_level || 'low',
      kycDetails: kycResult,
      fraudDetails: fraudResult
    };
  }, [verifyKYC, analyzeFraud]);

  return {
    verifyUser,
    verifyKYC,
    analyzeFraud,
    loading,
    error
  };
};

// Hook for content safety workflow
export const useContentSafety = () => {
  const { moderateContent, createPoll, loading, error } = useAIServices();
  
  const checkContentSafety = useCallback(async (
    content: string,
    sourceType: string = 'aid_request'
  ) => {
    const result = await moderateContent({ text: content, source_type: sourceType });
    
    return {
      isSafe: result.moderation_result?.safe || false,
      riskLevel: result.moderation_result?.risk_level || 'medium',
      flags: result.moderation_result?.flags || [],
      recommendation: result.moderation_result?.recommendation || 'Manual review required',
      fullResult: result
    };
  }, [moderateContent]);

  const createSafetyPoll = useCallback(async (
    claimText: string,
    location: string,
    durationHours: number = 24
  ) => {
    // First check content safety
    const safetyCheck = await checkContentSafety(claimText);
    
    if (!safetyCheck.isSafe) {
      throw new Error(`Content flagged as unsafe: ${safetyCheck.flags.join(', ')}`);
    }

    // Create poll if content is safe
    const pollResult = await createPoll({
      claim_text: claimText,
      location,
      duration_hours: durationHours
    });

    return {
      pollId: pollResult.poll?.poll_id,
      status: pollResult.poll?.status,
      safetyCheck,
      fullResult: pollResult
    };
  }, [checkContentSafety, createPoll]);

  return {
    checkContentSafety,
    createSafetyPoll,
    moderateContent,
    createPoll,
    loading,
    error
  };
};

// Hook for AI service monitoring
export const useAIServiceMonitoring = () => {
  const { checkServiceStatus, loading, error } = useAIServices();
  const [serviceHealth, setServiceHealth] = useState<any>(null);

  const refreshServiceStatus = useCallback(async () => {
    try {
      const status = await checkServiceStatus();
      setServiceHealth(status);
      return status;
    } catch (err) {
      console.error('Failed to check service status:', err);
      return null;
    }
  }, [checkServiceStatus]);

  return {
    serviceHealth,
    refreshServiceStatus,
    loading,
    error
  };
};

export default useAIServices;
