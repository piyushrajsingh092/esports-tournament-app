export interface User {
    id: string;
    username: string;
    email: string;
    balance: number;
    role: 'user' | 'admin';
    avatar?: string;
    upiId?: string;
}

export interface PrizeDistribution {
    rank: number;
    amount: number;
}

export interface TournamentResult {
    id: string;
    tournamentId: string;
    userId: string;
    rank: number;
    kills: number;
    prizeWon: number;
    username?: string; // For display
}

export interface Tournament {
    id: string;
    title: string;
    game: string;
    entryFee: number;
    prizePool: number;
    perKillReward?: number;
    startDate: string;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    maxPlayers: number;
    currentPlayers: number;
    image: string;
    description: string;
    rules: string;
    roomId?: string;
    roomPassword?: string;
    participants: string[]; // Array of User IDs
    winnerId?: string;
    prizeDistributions?: PrizeDistribution[];
    results?: TournamentResult[];
}

export interface Transaction {
    id: string;
    userId: string;
    type: 'deposit' | 'withdrawal' | 'tournament_entry' | 'prize' | 'refund';
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    date: string;
    upiRef?: string; // For deposits
    userUpiId?: string; // For withdrawals
}

export interface Match {
    id: string;
    tournamentId: string;
    player1: string;
    player2: string;
    score1?: number;
    score2?: number;
    winner?: string;
    startTime: string;
}
