import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AIVerificationResult {
  needs_detection: {
    detected_needs: any[];
    total_needs: number;
  };
  news_verification: {
    verified: boolean;
    status: string;
    confidence: number;
    summary: string;
  };
  content_moderation: {
    safe: boolean;
    risk_level: string;
    flags: string[];
  };
  community_poll?: {
    poll_id: string;
    status: string;
  };
}

interface AIVerificationComponentProps {
  claimText: string;
  location?: string;
  onVerificationComplete?: (result: AIVerificationResult) => void;
}

export const AIVerificationComponent: React.FC<AIVerificationComponentProps> = ({
  claimText,
  location,
  onVerificationComplete
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<AIVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAIVerification = async () => {
    if (!claimText.trim()) {
      setError('Please provide a claim to verify');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8002/api/ai/comprehensive-check?claim=${encodeURIComponent(claimText)}&location=${encodeURIComponent(location || '')}`);
      
      if (!response.ok) {
        throw new Error(`AI verification failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const result = data.pipeline_results;
        setVerificationResult(result);
        onVerificationComplete?.(result);
      } else {
        throw new Error('AI verification returned unsuccessful response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getVerificationIcon = (verified: boolean, confidence: number) => {
    if (verified && confidence > 0.8) return '✅';
    if (verified && confidence > 0.5) return '⚠️';
    return '❌';
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🤖 AI-Powered Verification
          <span className="text-sm font-normal text-gray-500">
            GPT-4o + NewsAPI + Community Validation
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="space-y-2">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Claim to Verify:</p>
            <p className="font-medium">{claimText}</p>
            {location && <p className="text-sm text-gray-500">Location: {location}</p>}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={runAIVerification}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '🔄 Running AI Verification...' : '🚀 Start AI Verification Pipeline'}
        </button>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">❌ {error}</p>
          </div>
        )}

        {/* Results Display */}
        {verificationResult && (
          <div className="space-y-4">
            {/* Needs Detection Results */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  🔍 Needs Detection
                  <span className="text-sm font-normal text-gray-500">
                    OpenAI GPT-4o
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {verificationResult.needs_detection.total_needs > 0 ? (
                  <div className="space-y-2">
                    <p className="text-green-600 font-medium">
                      ✅ {verificationResult.needs_detection.total_needs} needs detected
                    </p>
                    <div className="space-y-2">
                      {verificationResult.needs_detection.detected_needs.map((need, index) => (
                        <div key={index} className="p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                          <div className="text-sm">
                            <span className="font-medium">Need:</span> {need.need}
                            {need.quantity && (
                              <span className="ml-2"><span className="font-medium">Qty:</span> {need.quantity}</span>
                            )}
                            {need.urgency && (
                              <span className="ml-2"><span className="font-medium">Urgency:</span> {need.urgency}</span>
                            )}
                            {need.location && (
                              <span className="ml-2"><span className="font-medium">Location:</span> {need.location}</span>
                            )}
                            <div className="text-xs text-gray-600 mt-1">
                              Confidence: {(need.confidence * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-yellow-600">⚠️ No specific needs detected in the text</p>
                )}
              </CardContent>
            </Card>

            {/* News Verification Results */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  📰 News Verification
                  <span className="text-sm font-normal text-gray-500">
                    NewsAPI + Fact Check
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {getVerificationIcon(
                        verificationResult.news_verification.verified,
                        verificationResult.news_verification.confidence
                      )}
                    </span>
                    <span className="font-medium">
                      Status: {verificationResult.news_verification.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({(verificationResult.news_verification.confidence * 100).toFixed(1)}% confidence)
                    </span>
                  </div>
                  {verificationResult.news_verification.summary && (
                    <div className="p-3 bg-gray-50 rounded text-sm">
                      {verificationResult.news_verification.summary}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Content Moderation Results */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  🛡️ Content Safety
                  <span className="text-sm font-normal text-gray-500">
                    Perspective API
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {verificationResult.content_moderation.safe ? '✅' : '⚠️'}
                    </span>
                    <span className="font-medium">
                      {verificationResult.content_moderation.safe ? 'Content Safe' : 'Content Flagged'}
                    </span>
                    <span className={`text-sm ${getRiskColor(verificationResult.content_moderation.risk_level)}`}>
                      ({verificationResult.content_moderation.risk_level} risk)
                    </span>
                  </div>
                  
                  {verificationResult.content_moderation.flags.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Flags detected:</p>
                      {verificationResult.content_moderation.flags.map((flag, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded mr-2"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Community Poll Results */}
            {verificationResult.community_poll && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    🗳️ Community Validation
                    <span className="text-sm font-normal text-gray-500">
                      Crowd-sourced verification
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🗳️</span>
                      <span className="font-medium">
                        Poll Created: {verificationResult.community_poll.poll_id}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Community members can now vote to verify this claim.
                      Status: {verificationResult.community_poll.status}
                    </p>
                    <button className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                      View Community Poll
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Overall Recommendation */}
            <Card className="border-2 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  🎯 AI Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {verificationResult.needs_detection.total_needs > 0 && (
                    <div className="flex items-center gap-2 text-green-600">
                      <span>✅</span>
                      <span>Structured needs successfully extracted</span>
                    </div>
                  )}
                  
                  {verificationResult.news_verification.verified ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <span>✅</span>
                      <span>News sources support this claim</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-yellow-600">
                      <span>⚠️</span>
                      <span>Could not verify claim with news sources</span>
                    </div>
                  )}
                  
                  {verificationResult.content_moderation.safe ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <span>✅</span>
                      <span>Content passes safety checks</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <span>❌</span>
                      <span>Content flagged for manual review</span>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-800">Overall Assessment:</p>
                    <p className="text-sm text-blue-700">
                      {verificationResult.content_moderation.safe && verificationResult.needs_detection.total_needs > 0
                        ? "✅ This appears to be a legitimate aid request. Consider proceeding with donation processing."
                        : "⚠️ This request requires additional verification before proceeding."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIVerificationComponent;
