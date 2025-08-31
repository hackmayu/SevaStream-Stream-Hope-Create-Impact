import express, { Request, Response } from 'express';

const router = express.Router();

// GET /api/verification/status/:address - Get verification status
router.get('/status/:address', (req: Request, res: Response) => {
  try {
    // Mock verification data
    const verificationData = {
      address: req.params.address,
      identity: {
        governmentId: { status: 'verified', submittedAt: '2025-01-15T10:00:00Z' },
        phoneNumber: { status: 'verified', submittedAt: '2025-01-16T10:00:00Z' },
        addressProof: { status: 'pending', submittedAt: '2025-01-17T10:00:00Z' },
        bankAccount: { status: 'verified', submittedAt: '2025-01-16T15:00:00Z' }
      },
      needs: {
        medicalRecords: { status: 'verified', submittedAt: '2025-01-15T10:00:00Z' },
        financialDocuments: { status: 'verified', submittedAt: '2025-01-16T10:00:00Z' },
        supportingDocuments: { status: 'review', submittedAt: '2025-01-17T10:00:00Z' },
        thirdPartyVerification: { status: 'verified', submittedAt: '2025-01-18T10:00:00Z' }
      },
      overallStatus: 'verified',
      verifiedAt: '2025-01-18T15:30:00Z'
    };
    
    res.json(verificationData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch verification status' });
  }
});

// POST /api/verification/submit - Submit verification documents
router.post('/submit', (req: Request, res: Response) => {
  try {
    const { address, documentType, documentData } = req.body;
    
    if (!address || !documentType || !documentData) {
      return res.status(400).json({
        error: 'Missing required fields: address, documentType, documentData'
      });
    }
    
    // Mock document submission
    const submissionResult = {
      id: Math.random().toString(36).substr(2, 9),
      address,
      documentType,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      estimatedReviewTime: '2-3 business days'
    };
    
    res.status(201).json({
      message: 'Document submitted successfully',
      submission: submissionResult
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit verification document' });
  }
});

// GET /api/verification/requirements - Get verification requirements
router.get('/requirements', (req: Request, res: Response) => {
  try {
    const requirements = {
      identity: [
        {
          type: 'governmentId',
          name: 'Government ID',
          description: 'Valid government-issued photo ID (Aadhaar, PAN, Passport, etc.)',
          required: true,
          formats: ['PDF', 'JPG', 'PNG'],
          maxSize: '5MB'
        },
        {
          type: 'phoneNumber',
          name: 'Phone Number',
          description: 'Valid mobile number for OTP verification',
          required: true,
          formats: ['SMS'],
          maxSize: null
        },
        {
          type: 'addressProof',
          name: 'Address Proof',
          description: 'Utility bill, bank statement, or rent agreement',
          required: true,
          formats: ['PDF', 'JPG', 'PNG'],
          maxSize: '5MB'
        },
        {
          type: 'bankAccount',
          name: 'Bank Account',
          description: 'Bank account details for fund transfer',
          required: true,
          formats: ['Bank Statement'],
          maxSize: '5MB'
        }
      ],
      needs: [
        {
          type: 'medicalRecords',
          name: 'Medical Records',
          description: 'Medical reports, prescriptions, or hospital bills',
          required: false,
          formats: ['PDF', 'JPG', 'PNG'],
          maxSize: '10MB'
        },
        {
          type: 'financialDocuments',
          name: 'Financial Documents',
          description: 'Income certificate, tax returns, or employment proof',
          required: false,
          formats: ['PDF'],
          maxSize: '5MB'
        },
        {
          type: 'supportingDocuments',
          name: 'Supporting Documents',
          description: 'Additional documents supporting your need',
          required: false,
          formats: ['PDF', 'JPG', 'PNG'],
          maxSize: '10MB'
        },
        {
          type: 'thirdPartyVerification',
          name: 'Third-party Verification',
          description: 'Letter from NGO, hospital, or government agency',
          required: false,
          formats: ['PDF'],
          maxSize: '5MB'
        }
      ]
    };
    
    res.json(requirements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch verification requirements' });
  }
});

export default router;
