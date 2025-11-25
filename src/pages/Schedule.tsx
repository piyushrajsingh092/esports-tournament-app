import { useEffect } from 'react';
import { useStore } from '../lib/store';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Calendar, Trophy, Users } from 'lucide-react';
import { format, isToday, isTomorrow, isThisWeek, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';

export function Schedule() {
    const { tournaments, fetchTournaments } = useStore();

    useEffect(() => {
        fetchTournaments();
    }, [fetchTournaments]);

    // Filter upcoming tournaments and sort by date
    const upcomingTournaments = tournaments
        .filter(t => t.status === 'upcoming')
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    // Group tournaments by date
    const groupedTournaments = upcomingTournaments.reduce((groups, tournament) => {
        const date = parseISO(tournament.startDate);
        let key = 'Later';

        if (isToday(date)) key = 'Today';
        else if (isTomorrow(date)) key = 'Tomorrow';
        else if (isThisWeek(date)) key = 'This Week';
        else key = format(date, 'MMMM yyyy');

        if (!groups[key]) groups[key] = [];
        groups[key].push(tournament);
        return groups;
    }, {} as Record<string, typeof tournaments>);

    const groupOrder = ['Today', 'Tomorrow', 'This Week'];
    const sortedGroups = Object.keys(groupedTournaments).sort((a, b) => {
        const indexA = groupOrder.indexOf(a);
        const indexB = groupOrder.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b); // Sort other keys alphabetically or by date logic if needed
    });

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
                <Calendar className="h-8 w-8 text-primary" />
                Tournament Schedule
            </h1>

            {upcomingTournaments.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-xl text-muted-foreground">No upcoming tournaments scheduled.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {sortedGroups.map(group => (
                        <div key={group}>
                            <h2 className="text-2xl font-bold mb-4 text-primary">{group}</h2>
                            <div className="grid gap-4">
                                {groupedTournaments[group].map(tournament => (
                                    <Link key={tournament.id} to={`/tournaments/${tournament.id}`}>
                                        <Card className="hover:border-primary transition-colors">
                                            <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-center">
                                                <div className="flex-shrink-0 text-center md:text-left min-w-[100px]">
                                                    <div className="text-2xl font-bold text-primary">
                                                        {format(parseISO(tournament.startDate), 'HH:mm')}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {format(parseISO(tournament.startDate), 'MMM d, yyyy')}
                                                    </div>
                                                </div>

                                                <div className="flex-1 text-center md:text-left">
                                                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                                        <Badge variant="secondary">{tournament.game}</Badge>
                                                        <Badge variant="outline" className="border-primary/50 text-primary">
                                                            Entry: ₹{tournament.entryFee}
                                                        </Badge>
                                                    </div>
                                                    <h3 className="text-xl font-bold mb-2">{tournament.title}</h3>
                                                    <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Trophy className="h-4 w-4" />
                                                            <span>Prize: ₹{tournament.prizePool}</span>
                                                        </div>
                                                        {tournament.perKillReward && (
                                                            <div className="flex items-center gap-1">
                                                                <span>🎯</span>
                                                                <span className="text-green-600 dark:text-green-400 font-medium">₹{tournament.perKillReward}/kill</span>
                                                            </div>
                                                        )}
                                                        {tournament.prizeDistributions && tournament.prizeDistributions.length > 0 && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-xs">🏆</span>
                                                                <span className="text-xs font-medium">Top {tournament.prizeDistributions.length}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1">
                                                            <Users className="h-4 w-4" />
                                                            <span>{tournament.currentPlayers}/{tournament.maxPlayers}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-shrink-0">
                                                    <Button>View Details</Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Helper component since Button wasn't imported
function Button({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
