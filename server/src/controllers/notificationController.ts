import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';
import { sendBroadcastEmail } from '../utils/emailService';

export const sendBroadcast = async (req: Request, res: Response) => {
    const { subject, message } = req.body;

    if (!subject || !message) {
        res.status(400).json({ error: 'Subject and message are required' });
        return;
    }

    try {
        // Fetch all user emails
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('email'); // Assuming email is in profiles or we need to fetch from auth.users (which we can't directly via client usually)

        // Note: In a real Supabase app, profiles table usually has email copied. 
        // If not, we might need a different approach. Assuming profiles has email for now as per schema exploration.

        if (error) throw error;

        const emails = profiles
            .map((p: any) => p.email)
            .filter((email: string) => email); // Filter out nulls

        if (emails.length === 0) {
            res.status(400).json({ error: 'No users found to notify' });
            return;
        }

        const success = await sendBroadcastEmail(emails, subject, message);

        if (success) {
            res.json({ message: `Broadcast sent to ${emails.length} users` });
        } else {
            res.status(500).json({ error: 'Failed to send emails' });
        }

    } catch (error: any) {
        console.error('Broadcast error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const sendTestEmail = async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    console.log('Attempting to send test email to:', email);
    console.log('EMAIL_USER present:', !!process.env.EMAIL_USER);
    console.log('EMAIL_PASS present:', !!process.env.EMAIL_PASS);

    try {
        const success = await sendBroadcastEmail([email], 'Test Email', 'This is a test email from the Esports App to verify your configuration.');
        if (success) {
            res.json({ message: 'Test email sent successfully' });
        } else {
            res.status(500).json({ error: 'Failed to send test email. Check server logs.' });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
