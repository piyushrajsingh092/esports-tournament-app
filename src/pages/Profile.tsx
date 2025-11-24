import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { useStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { User, Wallet, History, Lock } from 'lucide-react';

export function Profile() {
    const { currentUser, transactions, fetchTransactions, updateProfile } = useStore();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [newUsername, setNewUsername] = useState(currentUser?.username || '');
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    const handleUpdateProfile = async () => {
        if (!newUsername.trim()) return alert('Username cannot be empty');
        setIsUpdatingProfile(true);
        try {
            await updateProfile(newUsername);
            alert('Profile updated successfully!');
        } catch (error: any) {
            alert('Failed to update profile: ' + error.message);
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            alert('Password changed successfully!');
            setNewPassword('');
            setConfirmPassword('');
            setIsChangingPassword(false);
        } catch (error: any) {
            alert('Failed to change password: ' + error.message);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    if (!currentUser) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <h2 className="text-2xl font-bold">Please Login</h2>
                <p className="text-muted-foreground">You need to be logged in to view your profile.</p>
                <Link to="/">
                    <Button>Go Home</Button>
                </Link>
            </div>
        );
    }

    const userTransactions = transactions.filter(t => t.userId === currentUser.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-10 w-10 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">{currentUser.username}</h1>
                    <p className="text-muted-foreground">{currentUser.email}</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5" />
                            Wallet Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-4xl font-bold">₹{currentUser.balance}</div>
                        <div className="flex gap-4">
                            <Link to="/wallet" className="flex-1">
                                <Button className="w-full">Deposit / Withdraw</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {userTransactions.length === 0 ? (
                                <p className="text-muted-foreground">No recent transactions.</p>
                            ) : (
                                userTransactions.slice(0, 5).map((tx) => {
                                    const isCredit = tx.type === 'deposit' || tx.type === 'prize';
                                    const displayType = tx.type === 'prize' ? 'Prize Won 🏆' :
                                        tx.type === 'tournament_entry' ? 'Tournament Entry' :
                                            tx.type.charAt(0).toUpperCase() + tx.type.slice(1);

                                    return (
                                        <div key={tx.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                            <div>
                                                <p className="font-medium">{displayType}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold ${isCredit ? 'text-green-500' : 'text-red-500'}`}>
                                                    {isCredit ? '+' : '-'}₹{tx.amount}
                                                </p>
                                                <Badge variant={tx.status === 'approved' ? 'default' : tx.status === 'rejected' ? 'destructive' : 'secondary'} className="text-[10px]">
                                                    {tx.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Edit Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Username</label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        placeholder="Enter username"
                                    />
                                    <Button onClick={handleUpdateProfile} disabled={isUpdatingProfile}>
                                        {isUpdatingProfile ? 'Saving...' : 'Save'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Change Password
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isChangingPassword ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">New Password</label>
                                    <Input
                                        type="password"
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Confirm Password</label>
                                    <Input
                                        type="password"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handlePasswordChange} className="flex-1">Save</Button>
                                    <Button onClick={() => setIsChangingPassword(false)} variant="outline" className="flex-1">Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <Button onClick={() => setIsChangingPassword(true)} className="w-full">Change Password</Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
