import express from 'express';
import { createPaymentOrder, handleCallback, checkPaymentStatus } from '../controllers/paymentController';

const router = express.Router();

router.post('/create-order', createPaymentOrder);
router.post('/phonepe/callback', handleCallback);
router.get('/status/:transactionId', checkPaymentStatus);

export default router;
