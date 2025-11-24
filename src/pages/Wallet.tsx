import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useStore } from '../lib/store';
import { ArrowUpCircle, ArrowDownCircle, Copy, Check, Zap } from 'lucide-react';
import api from '../lib/api';

export function Wallet() {
    const { currentUser, requestDeposit, requestWithdrawal } = useStore();
    const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
    const [amount, setAmount] = useState('');
    const [upiRef, setUpiRef] = useState(''); // For deposit
    const [upiId, setUpiId] = useState(''); // For withdrawal
    const [copied, setCopied] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'manual' | 'phonepe'>('phonepe');

    const ADMIN_UPI = "6202442690@ptyes";

    const handleCopy = () => {
        navigator.clipboard.writeText(ADMIN_UPI);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        if (activeTab === 'deposit') {
            if (paymentMethod === 'phonepe') {
                // PhonePe instant payment
                try {
                    const response = await api.post('/payments/create-order', {
                        userId: currentUser?.id,
                        amount: Number(amount)
                    });

                    if (response.data.success) {
                        // Redirect to PhonePe payment page
                        window.location.href = response.data.data.instrumentResponse.redirectInfo.url;
                    } else {
                        alert('Payment initiation failed. Please try again.');
                    }
                } catch (error) {
                    console.error('PhonePe payment error:', error);
                    alert('Payment failed. Please try manual UPI or contact support.');
                }
            } else {
                // Manual UPI
                if (!upiRef) {
                    alert("Please enter the UPI Reference ID");
                    return;
                }
                requestDeposit(Number(amount), upiRef);
                alert("Deposit request submitted successfully!");
                setAmount('');
                setUpiRef('');
            }
        } else {
            if (!upiId) {
                alert("Please enter your UPI ID");
                return;
            }
            if (currentUser && currentUser.balance < Number(amount)) {
                alert("Insufficient balance");
                return;
            }
            requestWithdrawal(Number(amount), upiId);
            alert("Withdrawal request submitted successfully!");
        }
        setAmount('');
        setUpiRef('');
        setUpiId('');
    };

    if (!currentUser) {
        return <div className="p-10 text-center">Please login to access wallet</div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Wallet</h1>
                <p className="text-muted-foreground">Manage your funds securely</p>
            </div>

            {/* Wallet Balance Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">Current Balance</p>
                        <p className="text-4xl font-bold text-primary">₹{currentUser.balance}</p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
                <Button
                    variant={activeTab === 'deposit' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('deposit')}
                    className="h-24 flex flex-col gap-2"
                >
                    <ArrowDownCircle className="h-6 w-6" />
                    Deposit
                </Button>
                <Button
                    variant={activeTab === 'withdraw' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('withdraw')}
                    className="h-24 flex flex-col gap-2"
                >
                    <ArrowUpCircle className="h-6 w-6" />
                    Withdraw
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{activeTab === 'deposit' ? 'Add Funds' : 'Withdraw Funds'}</CardTitle>
                    <CardDescription>
                        {activeTab === 'deposit'
                            ? 'Transfer amount to the UPI ID below and submit the reference number.'
                            : 'Enter amount and your UPI ID to receive funds.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {activeTab === 'deposit' && (
                        <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Admin UPI ID</p>
                            <div className="flex items-center justify-between bg-background p-2 rounded border">
                                <code className="text-primary font-bold">{ADMIN_UPI}</code>
                                <Button size="icon" variant="ghost" onClick={handleCopy}>
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'deposit' && (
                        <div className="space-y-3">
                            <label className="text-sm font-medium">Payment Method</label>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    type="button"
                                    variant={paymentMethod === 'phonepe' ? 'default' : 'outline'}
                                    onClick={() => setPaymentMethod('phonepe')}
                                    className="h-auto py-3 flex flex-col gap-1"
                                >
                                    <Zap className="h-5 w-5" />
                                    <span className="text-xs">Instant Payment</span>
                                    <span className="text-xs text-muted-foreground">(PhonePe)</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant={paymentMethod === 'manual' ? 'default' : 'outline'}
                                    onClick={() => setPaymentMethod('manual')}
                                    className="h-auto py-3 flex flex-col gap-1"
                                >
                                    <Copy className="h-5 w-5" />
                                    <span className="text-xs">Manual UPI</span>
                                    <span className="text-xs text-muted-foreground">(Slower)</span>
                                </Button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'deposit' && paymentMethod === 'manual' && (
                        <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Admin UPI ID</p>
                            <div className="flex items-center justify-between bg-background p-2 rounded border">
                                <code className="text-primary font-bold">{ADMIN_UPI}</code>
                                <Button size="icon" variant="ghost" onClick={handleCopy}>
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Amount (₹)</label>
                            <Input
                                type="number"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>

                        {activeTab === 'deposit' && paymentMethod === 'manual' ? (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">UPI Reference ID (UTR)</label>
                                <Input
                                    placeholder="Enter 12-digit UTR number"
                                    value={upiRef}
                                    onChange={(e) => setUpiRef(e.target.value)}
                                />
                            </div>
                        ) : activeTab === 'withdraw' ? (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Your UPI ID</label>
                                <Input
                                    placeholder="username@upi"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                />
                            </div>
                        ) : null}

                        <Button className="w-full" size="lg" onClick={handleSubmit}>
                            {activeTab === 'deposit' ? 'Submit Deposit Request' : 'Request Withdrawal'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
