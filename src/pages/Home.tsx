import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useStore } from '../lib/store';
import { Trophy, Users, Calendar } from 'lucide-react';

export function Home() {
    const { tournaments, fetchTournaments } = useStore();

    useEffect(() => {
        fetchTournaments();
    }, [fetchTournaments]);

    const featuredTournaments = tournaments.slice(0, 3);

    return (
        <div className="space-y-10">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-background to-background p-10 md:p-16">
                <div className="relative z-10 max-w-2xl space-y-6">
                    <Badge variant="secondary" className="text-primary">
                        New Season Live
                    </Badge>
                    <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                        Compete in Top <span className="text-primary">Esports</span> Tournaments
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Join the community, showcase your skills, and win big prizes in BGMI, Valorant, and more.
                    </p>
                    <div className="flex gap-4">
                        <Link to="/tournaments">
                            <Button size="lg">Browse Tournaments</Button>
                        </Link>
                        <Link to="/leaderboard">
                            <Button size="lg" variant="outline">View Leaderboard</Button>
                        </Link>
                    </div>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/3 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80')] bg-cover bg-center opacity-10 mask-image-linear-gradient" />
            </section>

            {/* Featured Tournaments */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold">Featured Tournaments</h2>
                    <Link to="/tournaments">
                        <Button variant="ghost">View All</Button>
                    </Link>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {featuredTournaments.map((tournament) => (
                        <Card key={tournament.id} className="overflow-hidden border-muted/50 bg-muted/20 transition-colors hover:border-primary/50">
                            <div className="aspect-video w-full overflow-hidden">
                                <img
                                    src={tournament.image}
                                    alt={tournament.title}
                                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                />
                            </div>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <Badge>{tournament.game}</Badge>
                                    <Badge variant={tournament.status === 'upcoming' ? 'secondary' : 'default'}>
                                        {tournament.status}
                                    </Badge>
                                </div>
                                <CardTitle className="line-clamp-1">{tournament.title}</CardTitle>
                                <CardDescription className="line-clamp-2">{tournament.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-4 w-4 text-yellow-500" />
                                    <span>Prize Pool: ₹{tournament.prizePool}</span>
                                </div>
                                {tournament.perKillReward && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">🎯</span>
                                        <span className="text-green-600 dark:text-green-400 font-medium">₹{tournament.perKillReward}/kill</span>
                                    </div>
                                )}
                                {tournament.prizeDistributions && tournament.prizeDistributions.length > 0 && (
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs">🏆</span>
                                        <span className="text-xs font-medium">Top {tournament.prizeDistributions.length} win prizes</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-blue-500" />
                                    <span>{tournament.currentPlayers}/{tournament.maxPlayers} Players</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-green-500" />
                                    <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Link to={`/tournaments/${tournament.id}`} className="w-full">
                                    <Button className="w-full">Join for ₹{tournament.entryFee}</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}
