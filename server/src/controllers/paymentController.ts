import { Request, Response } from 'express';
import { prisma } from '../index';
import { initiatePayment, verifyPayment } from '../utils/phonePeService';
import { v4 as uuidv4 } from 'uuid';
import { createNotification, notifyAllAdmins } from '../utils/notificationService';

export const createPaymentOrder = async (req: Request, res: Response) => {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
        return res.status(400).json({ error: 'User ID and amount are required' });
    }

    try {
        const transactionId = `TXN_${Date.now()}_${uuidv4().substring(0, 8)}`;

        // Create pending transaction
        const transaction = await prisma.transactions.create({
            data: {
                id: transactionId,
                user_id: userId,
                type: 'deposit',
                amount: Number(amount),
                status: 'pending'
            }
        });

        // Initiate PhonePe payment
        const paymentResponse = await initiatePayment(Number(amount), userId, transactionId);

        if (paymentResponse.success) {
            res.json({
                success: true,
                data: paymentResponse.data,
                transactionId
            });
        } else {
            // Delete pending transaction if payment initiation failed
            await prisma.transactions.delete({ where: { id: transactionId } });
            res.status(400).json({
                success: false,
                error: 'Payment initiation failed'
            });
        }
    } catch (error: any) {
        console.error('Payment order creation error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const handleCallback = async (req: Request, res: Response) => {
    const { transactionId, merchantTransactionId } = req.body;

    try {
        const txnId = merchantTransactionId || transactionId;

        if (!txnId) {
            return res.status(400).json({ error: 'Transaction ID required' });
        }

        // Verify payment with PhonePe
        const status = await verifyPayment(txnId);

        console.log('PhonePe callback status:', status);

        if (status.success && status.code === 'PAYMENT_SUCCESS') {
            // Get transaction
            const transaction = await prisma.transactions.findUnique({
                where: { id: txnId }
            });

            if (transaction && transaction.status === 'pending') {
                // Update transaction and credit balance
                await prisma.$transaction([
                    prisma.transactions.update({
                        where: { id: txnId },
                        data: { status: 'approved' }
                    }),
                    prisma.profiles.update({
                        where: { id: transaction.user_id! },
                        data: { balance: { increment: transaction.amount } }
                    })
                ]);

                // Notify user
                await createNotification(
                    transaction.user_id!,
                    'Deposit Successful',
                    `₹${transaction.amount} has been added to your wallet via PhonePe.`,
                    'success'
                );

                // Notify admins
                await notifyAllAdmins(
                    'Payment Received',
                    `₹${transaction.amount} deposited successfully via PhonePe`,
                    'success'
                );
            }

            res.json({ success: true, message: 'Payment verified and balance updated' });
        } else {
            // Payment failed
            const transaction = await prisma.transactions.findUnique({
                where: { id: txnId }
            });

            if (transaction) {
                await prisma.transactions.update({
                    where: { id: txnId },
                    data: { status: 'rejected' }
                });

                // Notify user of failure
                await createNotification(
                    transaction.user_id!,
                    'Payment Failed',
                    `Your deposit of ₹${transaction.amount} failed. Please try again.`,
                    'error'
                );
            }

            res.json({ success: false, message: 'Payment failed' });
        }
    } catch (error: any) {
        console.error('Callback error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const checkPaymentStatus = async (req: Request, res: Response) => {
    const { transactionId } = req.params;

    try {
        const status = await verifyPayment(transactionId);
        res.json(status);
    } catch (error: any) {
        console.error('Status check error:', error);
        res.status(500).json({ error: error.message });
    }
};
