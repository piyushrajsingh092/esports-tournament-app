import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useStore } from '../lib/store';
import { Trophy, Medal } from 'lucide-react';

export function Leaderboard() {
    const { users, fetchUsers } = useStore();

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Sort users by balance as a proxy for "winnings" for this demo
    // In a real app, we would have a separate 'winnings' field
    const sortedUsers = [...users].sort((a, b) => b.balance - a.balance);

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">Global Leaderboard</h1>
                <p className="text-muted-foreground">Top players ranked by their earnings</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Top Players</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {sortedUsers.map((user, index) => (
                            <div
                                key={user.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors gap-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-8 w-8 items-center justify-center font-bold text-muted-foreground">
                                        {index + 1}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                                            {index === 0 ? <Trophy className="h-5 w-5 text-yellow-500" /> :
                                                index === 1 ? <Medal className="h-5 w-5 text-gray-400" /> :
                                                    index === 2 ? <Medal className="h-5 w-5 text-orange-500" /> :
                                                        <span className="font-bold text-primary">{(user.username || 'U').charAt(0).toUpperCase()}</span>}
                                        </div>
                                        <div>
                                            <p className="font-medium">{user.username || 'Unknown User'}</p>
                                            <p className="text-xs text-muted-foreground">Rank {index + 1}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="font-bold text-primary text-right sm:text-left pl-12 sm:pl-0">
                                    ₹{user.balance}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
