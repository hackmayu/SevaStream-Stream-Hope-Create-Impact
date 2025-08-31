import { useState, useCallback } from 'react'

interface X402PaymentRequest {
  amount: number
  currency: string
  recipient: string
  memo?: string
  streamId?: string
}

interface X402PaymentResponse {
  success: boolean
  transactionId?: string
  error?: string
  receipt?: {
    amount: number
    currency: string
    timestamp: number
    recipient: string
    sender: string
  }
}

interface X402Stream {
  id: string
  amount: number
  interval: number // in seconds
  recipient: string
  isActive: boolean
  totalSent: number
  startTime: number
}

export const useX402 = () => {
  const [activeStreams, setActiveStreams] = useState<X402Stream[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Initialize x402 payment protocol
  const initializeX402 = useCallback(async () => {
    try {
      // Check if x402 is supported
      if (typeof window !== 'undefined' && (window as any).x402) {
        console.log('x402 protocol detected')
        return true
      }
      
      // Fallback: simulate x402 for demo
      console.log('x402 protocol not detected, using simulation mode')
      return true
    } catch (error) {
      console.error('Failed to initialize x402:', error)
      return false
    }
  }, [])

  // Process single x402 payment
  const processPayment = useCallback(async (request: X402PaymentRequest): Promise<X402PaymentResponse> => {
    setIsProcessing(true)
    
    try {
      // Simulate x402 payment processing
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const transactionId = `x402_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const response: X402PaymentResponse = {
        success: true,
        transactionId,
        receipt: {
          amount: request.amount,
          currency: request.currency,
          timestamp: Date.now(),
          recipient: request.recipient,
          sender: 'user_wallet_address'
        }
      }
      
      console.log('x402 Payment processed:', response)
      return response
      
    } catch (error) {
      console.error('x402 payment failed:', error)
      return {
        success: false,
        error: 'Payment processing failed'
      }
    } finally {
      setIsProcessing(false)
    }
  }, [])

  // Start x402 payment stream
  const startPaymentStream = useCallback(async (
    amount: number, 
    recipient: string, 
    intervalSeconds: number = 10
  ): Promise<string | null> => {
    try {
      const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const newStream: X402Stream = {
        id: streamId,
        amount,
        recipient,
        interval: intervalSeconds,
        isActive: true,
        totalSent: 0,
        startTime: Date.now()
      }
      
      setActiveStreams(prev => [...prev, newStream])
      
      // Start the payment interval
      const intervalId = setInterval(async () => {
        const payment = await processPayment({
          amount,
          currency: 'INR',
          recipient,
          memo: `Stream payment ${streamId}`,
          streamId
        })
        
        if (payment.success) {
          setActiveStreams(prev => 
            prev.map(stream => 
              stream.id === streamId 
                ? { ...stream, totalSent: stream.totalSent + amount }
                : stream
            )
          )
        }
      }, intervalSeconds * 1000)
      
      // Store interval ID for cleanup
      ;(newStream as any).intervalId = intervalId
      
      console.log('x402 Payment stream started:', streamId)
      return streamId
      
    } catch (error) {
      console.error('Failed to start payment stream:', error)
      return null
    }
  }, [processPayment])

  // Stop payment stream
  const stopPaymentStream = useCallback((streamId: string) => {
    setActiveStreams(prev => {
      const stream = prev.find(s => s.id === streamId)
      if (stream && (stream as any).intervalId) {
        clearInterval((stream as any).intervalId)
      }
      
      return prev.map(s => 
        s.id === streamId 
          ? { ...s, isActive: false }
          : s
      )
    })
    
    console.log('x402 Payment stream stopped:', streamId)
  }, [])

  // Get stream statistics
  const getStreamStats = useCallback((streamId: string) => {
    const stream = activeStreams.find(s => s.id === streamId)
    if (!stream) return null
    
    const runtime = Date.now() - stream.startTime
    const expectedPayments = Math.floor(runtime / (stream.interval * 1000))
    const actualPayments = stream.totalSent / stream.amount
    
    return {
      streamId,
      runtime: runtime / 1000, // in seconds
      totalSent: stream.totalSent,
      expectedPayments,
      actualPayments,
      successRate: expectedPayments > 0 ? (actualPayments / expectedPayments) * 100 : 0,
      isActive: stream.isActive
    }
  }, [activeStreams])

  // Calculate x402 fees (typically very low)
  const calculateX402Fee = useCallback((amount: number): number => {
    // x402 protocol typically charges minimal fees
    // For micro-donations, fee could be as low as 0.1%
    return Math.max(0.01, amount * 0.001) // Minimum 1 paisa, 0.1% of amount
  }, [])

  // Get all active streams
  const getAllStreams = useCallback(() => {
    return activeStreams.filter(stream => stream.isActive)
  }, [activeStreams])

  // Get total amount being streamed
  const getTotalStreamAmount = useCallback(() => {
    return activeStreams
      .filter(stream => stream.isActive)
      .reduce((total, stream) => total + stream.amount, 0)
  }, [activeStreams])

  return {
    // State
    activeStreams: activeStreams.filter(s => s.isActive),
    isProcessing,
    
    // Methods
    initializeX402,
    processPayment,
    startPaymentStream,
    stopPaymentStream,
    getStreamStats,
    calculateX402Fee,
    getAllStreams,
    getTotalStreamAmount
  }
}
