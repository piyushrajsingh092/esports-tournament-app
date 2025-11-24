import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../lib/api';

export function PaymentCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
    const [message, setMessage] = useState('Processing your payment...');

    useEffect(() => {
        const verifyPayment = async () => {
            const transactionId = searchParams.get('transactionId') || searchParams.get('merchantTransactionId');

            if (!transactionId) {
                setStatus('failed');
                setMessage('Invalid payment link');
                return;
            }

            try {
                const response = await api.get(`/payments/status/${transactionId}`);

                if (response.data.success && response.data.code === 'PAYMENT_SUCCESS') {
                    setStatus('success');
                    setMessage('Payment successful! Your wallet has been credited.');
                } else {
                    setStatus('failed');
                    setMessage('Payment failed or was cancelled.');
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                setStatus('failed');
                setMessage('Unable to verify payment. Please contact support.');
            }
        };

        verifyPayment();
    }, [searchParams]);

    useEffect(() => {
        if (status !== 'loading') {
            const timer = setTimeout(() => {
                navigate('/wallet');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [status, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardContent className="pt-6 text-center space-y-6">
                    {status === 'loading' && (
                        <>
                            <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin" />
                            <h2 className="text-2xl font-bold">Processing Payment</h2>
                            <p className="text-muted-foreground">{message}</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
                            <h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2>
                            <p className="text-muted-foreground">{message}</p>
                            <p className="text-sm text-muted-foreground">Redirecting to wallet in 5 seconds...</p>
                        </>
                    )}

                    {status === 'failed' && (
                        <>
                            <XCircle className="h-16 w-16 mx-auto text-red-500" />
                            <h2 className="text-2xl font-bold text-red-600">Payment Failed</h2>
                            <p className="text-muted-foreground">{message}</p>
                            <p className="text-sm text-muted-foreground">Redirecting to wallet in 5 seconds...</p>
                        </>
                    )}

                    <Button
                        onClick={() => navigate('/wallet')}
                        className="w-full"
                    >
                        Go to Wallet Now
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
