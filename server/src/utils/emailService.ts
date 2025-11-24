import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // Help with potential certificate issues in cloud
    },
    logger: true,
    debug: true,
    connectionTimeout: 60000, // 60s
    greetingTimeout: 30000,   // 30s
    socketTimeout: 60000,     // 60s
    family: 4 // Force IPv4
} as any);

const sendViaResend = async (to: string | string[], subject: string, html: string) => {
    if (!process.env.RESEND_API_KEY) return false;

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: 'Esports App <onboarding@resend.dev>', // Default testing sender
                to: Array.isArray(to) ? to : [to],
                subject,
                html
            })
        });

        const data = await res.json();
        if (!res.ok) {
            console.error('Resend API Error:', data);
            return false;
        }
        console.log('Email sent via Resend:', data);
        return true;
    } catch (error) {
        console.error('Error sending via Resend:', error);
        return false;
    }
};

export const sendEmail = async (to: string, subject: string, html: string) => {
    // Try Resend first if configured
    if (process.env.RESEND_API_KEY) {
        return await sendViaResend(to, subject, html);
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        });
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

export const sendBroadcastEmail = async (bcc: string[], subject: string, message: string) => {
    // Try Resend first if configured
    if (process.env.RESEND_API_KEY) {
        // Resend recommends sending individually or using 'bcc' field carefully. 
        // For testing/free tier, we might be limited. 
        // But let's try sending to the first user or using bcc if supported.
        // Resend API supports 'bcc'.
        return await sendViaResend(bcc, `[Esports App] ${subject}`, `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #6d28d9;">Esports Tournament App Notification</h2>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    ${message}
                </div>
                <p style="font-size: 12px; color: #666;">You are receiving this email because you are a registered user of Esports Tournament App.</p>
            </div>
        `);
    }

    try {
        // Send in batches to avoid limits if necessary, but for now simple bcc
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            bcc, // Use BCC for broadcast to hide recipient emails
            subject: `[Esports App] ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #6d28d9;">Esports Tournament App Notification</h2>
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        ${message}
                    </div>
                    <p style="font-size: 12px; color: #666;">You are receiving this email because you are a registered user of Esports Tournament App.</p>
                </div>
            `
        });
        console.log('Broadcast email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending broadcast email:', error);
        return false;
    }
};

export const sendAdminAlert = async (subject: string, details: string) => {
    const adminEmail = process.env.EMAIL_USER; // Send to self/admin

    // Try Resend first
    if (process.env.RESEND_API_KEY) {
        // For Resend testing, we must send to the registered email (usually the admin's email)
        // So we can use the same logic.
        // Note: 'adminEmail' might come from EMAIL_USER env var, which is fine.
        // If EMAIL_USER is not set, we might need another way to know where to send.
        // Let's assume the user sets EMAIL_USER even if using Resend, just to know the admin email.
        if (!adminEmail) return;

        return await sendViaResend(adminEmail, `[Admin Alert] ${subject}`, `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #dc2626;">Admin Alert</h2>
                <p><strong>Subject:</strong> ${subject}</p>
                <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    ${details}
                </div>
            </div>
        `);
    }

    if (!adminEmail) return;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: adminEmail,
            subject: `[Admin Alert] ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #dc2626;">Admin Alert</h2>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        ${details}
                    </div>
                </div>
            `
        });
    } catch (error) {
        console.error('Error sending admin alert:', error);
    }
};
