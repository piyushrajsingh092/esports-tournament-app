import { Request, Response } from 'express';
import { prisma } from '../index';
import { sendAdminAlert } from '../utils/emailService';
import { createNotification, notifyAllAdmins } from '../utils/notificationService';

export const getTransactions = async (req: Request, res: Response) => {
    const { userId } = req.query;

    try {
        const where = userId ? { user_id: String(userId) } : {};
        const transactions = await prisma.transactions.findMany({
            where,
            orderBy: { created_at: 'desc' },
            include: { profiles: true }
        });
        res.json(transactions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const requestDeposit = async (req: Request, res: Response) => {
    const { userId, amount, upiRef } = req.body;

    try {
        const transaction = await prisma.transactions.create({
            data: {
                user_id: userId,
                type: 'deposit',
                amount: Number(amount),
                upi_ref: upiRef,
                status: 'pending'
            }
        });

        await sendAdminAlert(
            'New Deposit Request',
            `User ${userId} requested a deposit of ₹${amount}. UPI Ref: ${upiRef}`
        );

        // Notify all admins in-app
        await notifyAllAdmins(
            'New Deposit Request',
            `A user requested a deposit of ₹${amount}. Please review and approve.`,
            'info'
        );

        res.status(201).json(transaction);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const requestWithdrawal = async (req: Request, res: Response) => {
    const { userId, amount, upiId } = req.body;

    try {
        const user = await prisma.profiles.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found");

        if (Number(user.balance) < Number(amount)) {
            return res.status(400).json({ error: "Insufficient balance" });
        }

        await prisma.$transaction([
            prisma.profiles.update({
                where: { id: userId },
                data: { balance: { decrement: Number(amount) } }
            }),
            prisma.transactions.create({
                data: {
                    user_id: userId,
                    type: 'withdrawal',
                    amount: Number(amount),
                    user_upi_id: upiId,
                    status: 'pending'
                }
            })
        ]);

        await sendAdminAlert(
            'New Withdrawal Request',
            `User ${userId} requested a withdrawal of ₹${amount}. UPI ID: ${upiId}`
        );

        // Notify all admins in-app
        await notifyAllAdmins(
            'New Withdrawal Request',
            `A user requested a withdrawal of ₹${amount}. Please review and approve.`,
            'warning'
        );

        res.status(201).json({ message: "Withdrawal requested" });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const approveTransaction = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const transaction = await prisma.transactions.findUnique({ where: { id } });
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        if (transaction.status !== 'pending') {
            return res.status(400).json({ error: 'Transaction already processed' });
        }

        await prisma.transactions.update({
            where: { id },
            data: { status: 'approved' }
        });

        if (transaction.type === 'deposit') {
            await prisma.profiles.update({
                where: { id: transaction.user_id! },
                data: { balance: { increment: transaction.amount } }
            });

            await createNotification(
                transaction.user_id!,
                'Deposit Approved',
                `Your deposit of ₹${transaction.amount} has been approved and added to your wallet.`,
                'success'
            );
        }

        if (transaction.type === 'withdrawal') {
            await createNotification(
                transaction.user_id!,
                'Withdrawal Approved',
                `Your withdrawal of ₹${transaction.amount} has been approved and will be processed shortly.`,
                'success'
            );
        }

        res.json({ message: 'Transaction approved' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const rejectTransaction = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const transaction = await prisma.transactions.findUnique({ where: { id } });
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        if (transaction.status !== 'pending') {
            return res.status(400).json({ error: 'Transaction already processed' });
        }

        await prisma.transactions.update({
            where: { id },
            data: { status: 'rejected' }
        });

        if (transaction.type === 'withdrawal') {
            await prisma.profiles.update({
                where: { id: transaction.user_id! },
                data: { balance: { increment: transaction.amount } }
            });
        }

        await createNotification(
            transaction.user_id!,
            `${transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'} Rejected`,
            `Your ${transaction.type} request of ₹${transaction.amount} has been rejected.`,
            'error'
        );

        res.json({ message: 'Transaction rejected' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
