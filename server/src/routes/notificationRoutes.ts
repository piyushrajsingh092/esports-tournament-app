import express from 'express';
import { sendBroadcast, sendTestEmail } from '../controllers/notificationController';

const router = express.Router();

router.post('/broadcast', sendBroadcast);
router.post('/test', sendTestEmail);

export default router;
