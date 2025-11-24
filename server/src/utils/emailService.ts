import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        ciphers: 'SSLv3'
    },
    requireTLS: true,
    logger: true,
    debug: true,
    connectionTimeout: 10000, // 10 seconds
    family: 4 // Force IPv4
} as any);

export const sendEmail = async (to: string, subject: string, html: string) => {
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
