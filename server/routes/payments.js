import { Router } from 'express'
import { initiateRazorpayPayment, verifyRazorpayPayment, initiateStripePayment, verifyStripePayment, codConfirmation } from '../controllers/paymentController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.post('/razorpay/initiate', authenticate, initiateRazorpayPayment)
router.post('/razorpay/verify', authenticate, verifyRazorpayPayment)
router.post('/stripe/initiate', authenticate, initiateStripePayment)
router.post('/stripe/verify', authenticate, verifyStripePayment)
router.post('/cod/confirm', authenticate, codConfirmation)

export default router
