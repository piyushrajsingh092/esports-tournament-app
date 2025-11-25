import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useStore } from '../../lib/store';
import { Plus, Trash2 } from 'lucide-react';

export function AdminTournaments() {
    const { tournaments, users, createTournament, updateTournament, declareWinner, submitResults, cancelTournament, deleteTournament, fetchTournaments, fetchUsers } = useStore();
    const [isCreating, setIsCreating] = useState(false);
    const [editingTournament, setEditingTournament] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        game: '',
        entryFee: 0,
        prizePool: 0,
        perKillReward: 0,
        startDate: '',
        maxPlayers: 0,
        image: '',
        description: '',
        rules: ''
    });
    const [distributionType, setDistributionType] = useState<'winner-takes-all' | 'rank-based'>('winner-takes-all');
    const [prizeDistribution, setPrizeDistribution] = useState<{ rank: number; amount: number }[]>([]);
    const [editFormData, setEditFormData] = useState<{
        status: 'upcoming' | 'ongoing' | 'completed';
        roomId: string;
        roomPassword: string;
        winnerId: string;
    }>(
        {
            status: 'upcoming',
            roomId: '',
            roomPassword: '',
            winnerId: ''
        });
    const [resultsData, setResultsData] = useState<{ userId: string; rank: number; kills: number }[]>([]);

    useEffect(() => {
        fetchTournaments();
        fetchUsers();
    }, [fetchTournaments, fetchUsers]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const tournamentData = {
            ...formData,
            prizeDistribution: distributionType === 'rank-based' ? prizeDistribution : undefined
        };
        createTournament(tournamentData);
        setIsCreating(false);
        setFormData({
            title: '',
            game: '',
            entryFee: 0,
            prizePool: 0,
            perKillReward: 0,
            startDate: '',
            maxPlayers: 0,
            image: '',
            description: '',
            rules: ''
        });
        setDistributionType('winner-takes-all');
        setPrizeDistribution([]);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTournament) {
            updateTournament(editingTournament, {
                status: editFormData.status,
                roomId: editFormData.roomId,
                roomPassword: editFormData.roomPassword
            });

            if (editFormData.status === 'completed' && editFormData.winnerId) {
                declareWinner(editingTournament, editFormData.winnerId);
            }

            setEditingTournament(null);
        }
    };

    const startEditing = (tournament: any) => {
        setEditingTournament(tournament.id);
        setEditFormData({
            status: tournament.status,
            roomId: tournament.roomId || '',
            roomPassword: tournament.roomPassword || '',
            winnerId: tournament.winnerId || ''
        });
        // Initialize results data for participants
        const participants = getTournamentParticipants(tournament.id);
        setResultsData(participants.map(p => ({
            userId: p.id,
            rank: 0,
            kills: 0
        })));
    };

    const getTournamentParticipants = (tournamentId: string) => {
        const tournament = tournaments.find(t => t.id === tournamentId);
        if (!tournament || !tournament.participants) return [];
        return users.filter(u => tournament.participants.includes(u.id));
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Manage Tournaments</h1>
                <Button onClick={() => setIsCreating(!isCreating)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Tournament
                </Button>
            </div>

            {isCreating && (
                <Card>
                    <CardHeader>
                        <CardTitle>New Tournament Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Basic Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Title *</label>
                                        <Input
                                            placeholder="e.g. Spring Championship"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Game *</label>
                                        <Input
                                            placeholder="e.g. BGMI, Valorant"
                                            value={formData.game}
                                            onChange={e => setFormData({ ...formData, game: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Tournament Details */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tournament Details</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Entry Fee (₹) *</label>
                                        <Input
                                            type="number"
                                            placeholder="50"
                                            value={formData.entryFee}
                                            onChange={e => setFormData({ ...formData, entryFee: Number(e.target.value) })}
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Prize Pool (₹) *</label>
                                        <Input
                                            type="number"
                                            placeholder="500"
                                            value={formData.prizePool}
                                            onChange={e => setFormData({ ...formData, prizePool: Number(e.target.value) })}
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Per-Kill Reward (₹)</label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={formData.perKillReward}
                                            onChange={e => setFormData({ ...formData, perKillReward: Number(e.target.value) })}
                                            min="0"
                                        />
                                        <p className="text-xs text-muted-foreground">Optional: Reward amount per kill</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Max Players *</label>
                                        <Input
                                            type="number"
                                            placeholder="100"
                                            value={formData.maxPlayers}
                                            onChange={e => setFormData({ ...formData, maxPlayers: Number(e.target.value) })}
                                            required
                                            min="1"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Schedule */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Schedule</h3>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Start Date & Time *</label>
                                    <Input
                                        type="datetime-local"
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Media */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Media</h3>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Image URL *</label>
                                    <Input
                                        placeholder="https://example.com/tournament-image.jpg"
                                        value={formData.image}
                                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Prize Distribution */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Prize Distribution</h3>
                                <div className="space-y-3">
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="distributionType"
                                                value="winner-takes-all"
                                                checked={distributionType === 'winner-takes-all'}
                                                onChange={() => {
                                                    setDistributionType('winner-takes-all');
                                                    setPrizeDistribution([]);
                                                }}
                                            />
                                            <span className="text-sm">Winner Takes All</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="distributionType"
                                                value="rank-based"
                                                checked={distributionType === 'rank-based'}
                                                onChange={() => setDistributionType('rank-based')}
                                            />
                                            <span className="text-sm">Rank-Based Distribution</span>
                                        </label>
                                    </div>

                                    {distributionType === 'rank-based' && (
                                        <div className="space-y-2 border rounded-lg p-4 bg-muted/20">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-sm font-medium">Configure Prizes by Rank</label>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={() => setPrizeDistribution([...prizeDistribution, { rank: prizeDistribution.length + 1, amount: 0 }])}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" /> Add Rank
                                                </Button>
                                            </div>
                                            {prizeDistribution.map((pd, index) => (
                                                <div key={index} className="flex gap-2 items-center">
                                                    <span className="text-sm font-medium w-20">Rank {pd.rank}:</span>
                                                    <Input
                                                        type="number"
                                                        placeholder="Prize amount"
                                                        value={pd.amount}
                                                        onChange={e => {
                                                            const updated = [...prizeDistribution];
                                                            updated[index].amount = Number(e.target.value);
                                                            setPrizeDistribution(updated);
                                                        }}
                                                        min="0"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => {
                                                            const updated = prizeDistribution.filter((_, i) => i !== index);
                                                            // Re-number ranks
                                                            updated.forEach((item, i) => item.rank = i + 1);
                                                            setPrizeDistribution(updated);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {prizeDistribution.length === 0 && (
                                                <p className="text-sm text-muted-foreground">Click "Add Rank" to configure rank-based prizes</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Optional Details */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Optional Details</h3>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <Input
                                        placeholder="Brief description of the tournament..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Rules</label>
                                    <Input
                                        placeholder="Tournament rules and regulations..."
                                        value={formData.rules}
                                        onChange={e => setFormData({ ...formData, rules: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                                <Button type="submit">Create Tournament</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {editingTournament && (
                <Card className="border-primary">
                    <CardHeader>
                        <CardTitle>Manage Tournament</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="grid gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Status</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={editFormData.status}
                                        onChange={e => setEditFormData({ ...editFormData, status: e.target.value as 'upcoming' | 'ongoing' | 'completed' })}
                                    >
                                        <option value="upcoming">Upcoming</option>
                                        <option value="ongoing">Ongoing</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>

                                {editFormData.status === 'completed' && (
                                    <div className="border rounded-lg p-4 bg-muted/20">
                                        <label className="text-sm font-medium mb-3 block">Submit Tournament Results</label>
                                        <div className="space-y-2">
                                            {getTournamentParticipants(editingTournament).map((user, index) => {
                                                const resultData = resultsData.find(r => r.userId === user.id) || { userId: user.id, rank: 0, kills: 0 };
                                                const tournament = tournaments.find(t => t.id === editingTournament);
                                                let estimatedPrize = 0;
                                                if (resultData.rank > 0 && tournament) {
                                                    const rankPrize = tournament.prizeDistributions?.find(pd => pd.rank === resultData.rank);
                                                    if (rankPrize) estimatedPrize += rankPrize.amount;
                                                    if (tournament.perKillReward) estimatedPrize += tournament.perKillReward * resultData.kills;
                                                }

                                                return (
                                                    <div key={user.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-background rounded border">
                                                        <div className="col-span-4">
                                                            <p className="font-medium text-sm">{user.username}</p>
                                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                                        </div>
                                                        <div className="col-span-3">
                                                            <Input
                                                                type="number"
                                                                placeholder="Rank"
                                                                value={resultData.rank || ''}
                                                                onChange={e => {
                                                                    const updated = resultsData.filter(r => r.userId !== user.id);
                                                                    updated.push({ userId: user.id, rank: Number(e.target.value), kills: resultData.kills });
                                                                    setResultsData(updated);
                                                                }}
                                                                min="0"
                                                                className="h-8 text-sm"
                                                            />
                                                        </div>
                                                        <div className="col-span-3">
                                                            <Input
                                                                type="number"
                                                                placeholder="Kills"
                                                                value={resultData.kills || ''}
                                                                onChange={e => {
                                                                    const updated = resultsData.filter(r => r.userId !== user.id);
                                                                    updated.push({ userId: user.id, rank: resultData.rank, kills: Number(e.target.value) });
                                                                    setResultsData(updated);
                                                                }}
                                                                min="0"
                                                                className="h-8 text-sm"
                                                            />
                                                        </div>
                                                        <div className="col-span-2 text-right">
                                                            <p className="text-xs font-medium text-primary">₹{estimatedPrize}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <Button
                                            type="button"
                                            className="mt-3 w-full"
                                            onClick={() => {
                                                const validResults = resultsData.filter(r => r.rank > 0);
                                                if (validResults.length === 0) {
                                                    alert('Please assign ranks to at least one participant');
                                                    return;
                                                }
                                                if (window.confirm(`Submit results for ${validResults.length} participants?`)) {
                                                    submitResults(editingTournament, validResults);
                                                    setEditingTournament(null);
                                                }
                                            }}
                                        >
                                            Submit Results & Distribute Prizes
                                        </Button>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Enter rank (1, 2, 3...) and kills for each participant. Prizes will be calculated and distributed automatically.
                                        </p>
                                    </div>
                                )}

                                <Input
                                    placeholder="Room ID"
                                    value={editFormData.roomId}
                                    onChange={e => setEditFormData({ ...editFormData, roomId: e.target.value })}
                                />
                                <Input
                                    placeholder="Room Password"
                                    value={editFormData.roomPassword}
                                    onChange={e => setEditFormData({ ...editFormData, roomPassword: e.target.value })}
                                />

                                {/* Participants List */}
                                <div className="border rounded-lg p-4 bg-muted/20">
                                    <h3 className="font-semibold mb-3">Tournament Participants ({getTournamentParticipants(editingTournament).length}/{tournaments.find(t => t.id === editingTournament)?.maxPlayers})</h3>
                                    {getTournamentParticipants(editingTournament).length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No participants yet</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {getTournamentParticipants(editingTournament).map((user, index) => (
                                                <div key={user.id} className="flex items-center justify-between p-2 bg-background rounded border">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                                                        <div>
                                                            <p className="font-medium">{user.username}</p>
                                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium">Balance: ₹{user.balance}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setEditingTournament(null)}>Cancel</Button>
                                <Button type="submit">Save Changes</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4">
                {tournaments.map((tournament) => (
                    <Card key={tournament.id}>
                        <CardContent className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-4">
                                <img src={tournament.image} alt={tournament.title} className="h-16 w-16 rounded object-cover" />
                                <div>
                                    <h3 className="font-bold">{tournament.title}</h3>
                                    <div className="flex gap-2 text-sm text-muted-foreground">
                                        <Badge variant="secondary">{tournament.game}</Badge>
                                        <span>{tournament.participants.length}/{tournament.maxPlayers} Players</span>
                                        <span>Status: {tournament.status}</span>
                                    </div>
                                    {(tournament.roomId || tournament.roomPassword) && (
                                        <div className="mt-1 text-xs text-muted-foreground">
                                            Room ID: {tournament.roomId} | Pass: {tournament.roomPassword}
                                        </div>
                                    )}
                                    {tournament.winnerId && (
                                        <div className="mt-1 text-xs text-primary font-bold">
                                            Winner: {users.find(u => u.id === tournament.winnerId)?.username || 'Unknown'}
                                        </div>
                                    )}
                                    {tournament.status === 'cancelled' && (
                                        <div className="mt-1 text-xs text-red-500 font-bold">
                                            Tournament Cancelled - Refunds Processed
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {tournament.status !== 'cancelled' && tournament.status !== 'completed' && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                            if (window.confirm(`Cancel "${tournament.title}"? All participants will be refunded their entry fees.`)) {
                                                cancelTournament(tournament.id);
                                            }
                                        }}
                                    >
                                        Cancel Tournament
                                    </Button>
                                )}
                                <Button variant="outline" onClick={() => startEditing(tournament)}>
                                    Manage
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => {
                                        if (window.confirm(`Delete "${tournament.title}"? This action cannot be undone.`)) {
                                            deleteTournament(tournament.id);
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
