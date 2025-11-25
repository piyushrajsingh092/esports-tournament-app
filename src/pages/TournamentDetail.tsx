import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useStore } from '../lib/store';
import { Trophy, Users, Calendar, Clock, Shield, AlertCircle } from 'lucide-react';

export function TournamentDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { tournaments, currentUser, joinTournament, fetchTournaments, users, fetchUsers } = useStore();
    const tournament = tournaments.find(t => t.id === id);
    const [isJoining, setIsJoining] = useState(false);

    useEffect(() => {
        fetchTournaments();
        fetchUsers();
    }, [fetchTournaments, fetchUsers]);

    if (!tournament) {
        return <div className="p-10 text-center">Tournament not found</div>;
    }

    const winner = tournament.winnerId ? users.find(u => u.id === tournament.winnerId) : null;

    const handleJoin = () => {
        if (!currentUser) {
            alert("Please login to join");
            return;
        }
        if (currentUser.balance < tournament.entryFee) {
            alert("Insufficient balance. Please deposit funds.");
            navigate('/wallet');
            return;
        }
        setIsJoining(true);
        setTimeout(() => {
            joinTournament(tournament.id);
            setIsJoining(false);
            alert("Successfully joined tournament!");
        }, 1000);
    };

    return (
        <div className="space-y-8">
            {/* Header Image */}
            <div className="relative h-[300px] w-full overflow-hidden rounded-xl">
                <img
                    src={tournament.image}
                    alt={tournament.title}
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                    <Badge className="mb-4">{tournament.game}</Badge>
                    <h1 className="text-4xl font-bold">{tournament.title}</h1>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">{tournament.description}</p>

                            {winner && (
                                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                                    <h3 className="text-lg font-bold text-primary mb-1">🏆 Winner Declared</h3>
                                    <p className="text-xl font-bold">{winner.username}</p>
                                    <p className="text-sm text-muted-foreground">Prize: ₹{tournament.prizePool}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-yellow-500" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Prize Pool</p>
                                        <p className="font-bold">₹{tournament.prizePool}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Players</p>
                                        <p className="font-bold">{tournament.currentPlayers}/{tournament.maxPlayers}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-green-500" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Start Date</p>
                                        <p className="font-bold">{new Date(tournament.startDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-orange-500" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Time</p>
                                        <p className="font-bold">{new Date(tournament.startDate).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Prize Distribution */}
                    {(tournament.prizeDistributions && tournament.prizeDistributions.length > 0) || tournament.perKillReward ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Prize Distribution</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {tournament.prizeDistributions && tournament.prizeDistributions.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-3 text-sm text-muted-foreground">Rank-Based Prizes</h4>
                                        <div className="space-y-2">
                                            {tournament.prizeDistributions
                                                .sort((a, b) => a.rank - b.rank)
                                                .map((pd) => (
                                                    <div key={pd.rank} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${pd.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                                                                    pd.rank === 2 ? 'bg-gray-400/20 text-gray-400' :
                                                                        pd.rank === 3 ? 'bg-orange-500/20 text-orange-500' :
                                                                            'bg-primary/20 text-primary'
                                                                }`}>
                                                                {pd.rank === 1 ? '🥇' : pd.rank === 2 ? '🥈' : pd.rank === 3 ? '🥉' : `#${pd.rank}`}
                                                            </div>
                                                            <span className="font-medium">
                                                                {pd.rank === 1 ? '1st Place' :
                                                                    pd.rank === 2 ? '2nd Place' :
                                                                        pd.rank === 3 ? '3rd Place' :
                                                                            `${pd.rank}th Place`}
                                                            </span>
                                                        </div>
                                                        <span className="font-bold text-primary">₹{pd.amount}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {tournament.perKillReward && (
                                    <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">🎯</span>
                                                <div>
                                                    <p className="font-semibold text-green-600 dark:text-green-400">Per-Kill Reward</p>
                                                    <p className="text-xs text-muted-foreground">Earn extra for each elimination</p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-lg text-green-600 dark:text-green-400">₹{tournament.perKillReward}/kill</span>
                                        </div>
                                    </div>
                                )}

                                {!tournament.prizeDistributions?.length && !tournament.perKillReward && (
                                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                                        <div className="flex items-center gap-2">
                                            <Trophy className="h-5 w-5 text-primary" />
                                            <div>
                                                <p className="font-semibold">Winner Takes All</p>
                                                <p className="text-sm text-muted-foreground">The winner receives the entire prize pool of ₹{tournament.prizePool}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : null}

                    <Card>
                        <CardHeader>
                            <CardTitle>Rules</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start gap-2 text-muted-foreground">
                                <Shield className="mt-1 h-5 w-5 shrink-0" />
                                <p>{tournament.rules}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Registration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Entry Fee</span>
                                <span className="font-bold">₹{tournament.entryFee}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Status</span>
                                <Badge variant={tournament.status === 'upcoming' ? 'secondary' : 'default'}>
                                    {tournament.status}
                                </Badge>
                            </div>
                            <Button className="w-full" size="lg" onClick={handleJoin} disabled={isJoining || tournament.status !== 'upcoming' || tournament.currentPlayers >= tournament.maxPlayers}>
                                {isJoining ? 'Joining...' : (tournament.currentPlayers >= tournament.maxPlayers ? 'Full' : 'Join Tournament')}
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                                By joining, you agree to the tournament rules.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="mt-0.5 h-5 w-5 text-primary" />
                                <div className="space-y-1">
                                    <p className="font-medium text-primary">Need Help?</p>
                                    <p className="text-sm text-muted-foreground">
                                        Contact support if you face any issues joining this tournament.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
