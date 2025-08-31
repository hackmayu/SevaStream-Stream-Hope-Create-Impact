import { Request, Response, NextFunction } from 'express';

// x402 Payment Required middleware
export const x402Middleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for payment proof in headers
    const paymentProof = req.headers['x-payment-proof'];
    const paymentAmount = req.headers['x-payment-amount'];
    
    if (!paymentProof) {
      return res.status(402).json({
        error: 'Payment Required',
        message: 'This endpoint requires payment via x402 protocol',
        paymentInfo: {
          acceptedCurrencies: ['USDC', 'MATIC'],
          minimumAmount: '0.001',
          paymentAddress: process.env.PAYMENT_ADDRESS || '0x742d35Cc634C0532925a3b8D1a6B8C5e8Dfc1234',
          chainId: 80001 // Polygon Mumbai testnet
        }
      });
    }
    
    // Validate payment proof (simplified for demo)
    if (!isValidPaymentProof(paymentProof as string, paymentAmount as string)) {
      return res.status(402).json({
        error: 'Invalid Payment',
        message: 'Payment proof is invalid or insufficient'
      });
    }
    
    // Payment verified, proceed to next middleware
    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Payment Verification Error',
      message: 'Failed to verify payment'
    });
  }
};

// Helper function to validate payment proof
function isValidPaymentProof(proof: string, amount: string): boolean {
  // In a real implementation, this would:
  // 1. Verify the transaction hash exists on blockchain
  // 2. Check the transaction amount meets minimum requirements
  // 3. Ensure the payment was made to the correct address
  // 4. Verify the payment is recent (not replayed)
  
  // For demo purposes, we'll do basic validation
  if (!proof || proof.length < 10) return false;
  if (!amount || parseFloat(amount) < 0.001) return false;
  
  return true;
}
