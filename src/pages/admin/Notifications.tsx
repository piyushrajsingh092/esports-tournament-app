import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useStore } from '../../lib/store';

export function AdminNotifications() {
    const { sendBroadcast } = useStore();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            await sendBroadcast(subject, message);
            setStatus({ type: 'success', message: 'Broadcast sent successfully!' });
            setSubject('');
            setMessage('');
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message || 'Failed to send broadcast' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Broadcast Notifications</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Send Email to All Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {status && (
                            <div className={`p-3 rounded-md text-sm ${status.type === 'success' ? 'bg-green-500/15 text-green-500' : 'bg-destructive/15 text-destructive'
                                }`}>
                                {status.message}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Subject</label>
                            <Input
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g., New Tournament Announced!"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Message (HTML supported)</label>
                            <textarea
                                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter your message here..."
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                You can use basic HTML tags like &lt;b&gt;, &lt;i&gt;, &lt;br&gt;, &lt;p&gt;.
                            </p>
                        </div>

                        <Button type="submit" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Broadcast'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Debug Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Send a test email to yourself to verify the email configuration.
                    </p>
                    <Button variant="outline" onClick={async () => {
                        const email = prompt("Enter email to send test to:");
                        if (!email) return;
                        try {
                            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notifications/test`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email })
                            });
                            const data = await res.json();
                            if (res.ok) alert(data.message);
                            else alert("Error: " + data.error);
                        } catch (e: any) {
                            alert("Request failed: " + e.message);
                        }
                    }}>
                        Send Test Email
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
