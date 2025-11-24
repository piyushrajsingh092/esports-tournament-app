import crypto from 'crypto';
import axios from 'axios';

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || '';
const SALT_KEY = process.env.PHONEPE_SALT_KEY || '';
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';
const API_URL = process.env.PHONEPE_API_URL || 'https://api-preprod.phonepe.com/apis/pg-sandbox';

// Generate checksum for API requests
export const generateChecksum = (payload: string, endpoint: string): string => {
    const checksumString = payload + endpoint + SALT_KEY;
    const checksum = crypto.createHash('sha256').update(checksumString).digest('hex');
    return checksum + '###' + SALT_INDEX;
};

// Create payment request
export const initiatePayment = async (
    amount: number,
    userId: string,
    transactionId: string
) => {
    try {
        const payload = {
            merchantId: MERCHANT_ID,
            merchantTransactionId: transactionId,
            merchantUserId: userId,
            amount: Math.round(amount * 100), // Convert to paise
            redirectUrl: `${process.env.FRONTEND_URL}/payment/callback`,
            redirectMode: 'POST',
            callbackUrl: `${process.env.BACKEND_URL}/api/payments/phonepe/callback`,
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };

        const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
        const checksum = generateChecksum(base64Payload, '/pg/v1/pay');

        const response = await axios.post(
            `${API_URL}/pg/v1/pay`,
            {
                request: base64Payload
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum
                }
            }
        );

        return response.data;
    } catch (error: any) {
        console.error('PhonePe initiate payment error:', error.response?.data || error.message);
        throw error;
    }
};

// Verify payment status
export const verifyPayment = async (merchantTransactionId: string) => {
    try {
        const endpoint = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`;
        const checksumString = endpoint + SALT_KEY;
        const checksum = crypto.createHash('sha256').update(checksumString).digest('hex') + '###' + SALT_INDEX;

        const response = await axios.get(
            `${API_URL}${endpoint}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum,
                    'X-MERCHANT-ID': MERCHANT_ID
                }
            }
        );

        return response.data;
    } catch (error: any) {
        console.error('PhonePe verify payment error:', error.response?.data || error.message);
        throw error;
    }
};
