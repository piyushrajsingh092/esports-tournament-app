import { create } from 'zustand';
import type { User, Tournament, Transaction, Match } from './types';
import { supabase } from './supabase';
import api from './api';

interface AppState {
    currentUser: User | null;
    tournaments: Tournament[];
    users: User[];
    transactions: Transaction[];
    matches: Match[];
    isLoading: boolean;

    // Actions
    login: (email: string, password?: string) => Promise<void>;
    signup: (email: string, password: string, username: string) => Promise<void>;
    loginWithSocial: (provider: 'google' | 'facebook' | 'twitter') => Promise<void>;
    logout: () => Promise<void>;
    fetchTournaments: () => Promise<void>;
    fetchUsers: () => Promise<void>;
    fetchTransactions: () => Promise<void>;
    initializeRealtime: () => void;

    // User Actions
    joinTournament: (tournamentId: string) => Promise<void>;
    requestDeposit: (amount: number, upiRef: string) => Promise<void>;
    requestWithdrawal: (amount: number, upiId: string) => Promise<void>;

    // Admin Actions
    createTournament: (tournament: Omit<Tournament, 'id' | 'currentPlayers' | 'status' | 'participants'>) => Promise<void>;
    updateTournament: (id: string, data: Partial<Tournament>) => Promise<void>;
    deleteTournament: (id: string) => Promise<void>;
    declareWinner: (tournamentId: string, winnerId: string) => Promise<void>;
    cancelTournament: (tournamentId: string) => Promise<void>;
    approveTransaction: (transactionId: string) => Promise<void>;
    rejectTransaction: (transactionId: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
    currentUser: null,
    tournaments: [],
    users: [],
    transactions: [],
    matches: [],
    isLoading: false,

    login: async (email, password) => {
        if (!password) throw new Error("Password required");

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        if (data.user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (profile) {
                set({ currentUser: profile as User });
            }
        }
    },

    signup: async (email, password, username) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username
                }
            }
        });

        if (error) throw error;
    },

    loginWithSocial: async (provider: 'google' | 'facebook' | 'twitter') => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/`
            }
        });

        if (error) throw error;
    },

    logout: async () => {
        await supabase.auth.signOut();
        set({ currentUser: null });
    },

    fetchTournaments: async () => {
        try {
            const { data } = await api.get('/tournaments');
            const tournamentsWithParticipants = data.map((t: any) => ({
                ...t,
                startDate: t.start_date,
                entryFee: t.entry_fee,
                prizePool: t.prize_pool,
                maxPlayers: t.max_players,
                currentPlayers: t.tournament_participants ? t.tournament_participants.length : t.current_players,
                roomId: t.room_id,
                roomPassword: t.room_password,
                winnerId: t.winner_id,
                participants: t.tournament_participants?.map((p: any) => p.user_id) || []
            }));

            set({ tournaments: tournamentsWithParticipants as Tournament[] });
        } catch (error) {
            console.error("Fetch Tournaments Error:", error);
        }
    },

    fetchUsers: async () => {
        const { data } = await supabase.from('profiles').select('*');
        if (data) set({ users: data as User[] });
    },

    fetchTransactions: async () => {
        const { currentUser } = get();
        if (!currentUser) return;

        try {
            const { data } = await api.get('/transactions', {
                params: { userId: currentUser.role === 'admin' ? undefined : currentUser.id }
            });

            set({
                transactions: data.map((t: any) => ({
                    ...t,
                    userId: t.user_id,
                    date: t.created_at,
                    upiRef: t.upi_ref,
                    userUpiId: t.user_upi_id
                })) as Transaction[]
            });
        } catch (error) {
            console.error("Fetch Transactions Error:", error);
        }
    },

    initializeRealtime: () => {
        supabase
            .channel('public:tournaments')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, () => {
                get().fetchTournaments();
            })
            .subscribe();

        supabase
            .channel('public:profiles')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
                get().fetchUsers();
                // Also update current user if needed
                const { currentUser } = get();
                if (currentUser) {
                    supabase.from('profiles').select('*').eq('id', currentUser.id).single()
                        .then(({ data }) => {
                            if (data) set({ currentUser: data as User });
                        });
                }
            })
            .subscribe();

        supabase
            .channel('public:transactions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
                get().fetchTransactions();
                // Also refresh users to update balances if needed
                get().fetchUsers();
                // Refresh current user if balance changed
                const { currentUser } = get();
                if (currentUser) {
                    supabase.from('profiles').select('*').eq('id', currentUser.id).single()
                        .then(({ data }) => {
                            if (data) set({ currentUser: data as User });
                        });
                }
            })
            .subscribe();

        supabase
            .channel('public:tournament_participants')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tournament_participants' }, () => {
                get().fetchTournaments();
            })
            .subscribe();
    },

    joinTournament: async (tournamentId) => {
        const { currentUser } = get();
        if (!currentUser) return;

        try {
            await api.post(`/tournaments/${tournamentId}/join`, { userId: currentUser.id });
            // Optimistic update or wait for realtime
            get().fetchTournaments();
            get().fetchUsers();
        } catch (error: any) {
            const message = error.response?.data?.error || error.message || "Failed to join tournament";
            alert(message);
        }
    },

    requestDeposit: async (amount, upiRef) => {
        const { currentUser } = get();
        if (!currentUser) return;

        try {
            await api.post('/transactions/deposit', { userId: currentUser.id, amount, upiRef });
            get().fetchTransactions();
        } catch (error: any) {
            const message = error.response?.data?.error || error.message || "Failed to request deposit";
            alert(message);
        }
    },

    requestWithdrawal: async (amount, upiId) => {
        const { currentUser } = get();
        if (!currentUser) return;

        try {
            await api.post('/transactions/withdraw', { userId: currentUser.id, amount, upiId });
            get().fetchTransactions();
        } catch (error: any) {
            const message = error.response?.data?.error || error.message || "Failed to request withdrawal";
            alert(message);
        }
    },

    createTournament: async (tournamentData) => {
        try {
            await api.post('/tournaments', tournamentData);
            get().fetchTournaments();
            alert("Tournament created successfully!");
        } catch (error: any) {
            const message = error.response?.data?.error || error.message || "Failed to create tournament";
            alert(message);
        }
    },

    updateTournament: async (id, data) => {
        try {
            await api.put(`/tournaments/${id}`, data);
            get().fetchTournaments();
            alert("Tournament updated successfully!");
        } catch (error: any) {
            const message = error.response?.data?.error || error.message || "Failed to update tournament";
            alert(message);
        }
    },

    declareWinner: async (tournamentId, winnerId) => {
        try {
            await api.post('/winner/declare', { tournamentId, winnerId });
            get().fetchTournaments();
            get().fetchUsers();
            get().fetchTransactions(); // Refresh transactions to show prize
            alert('Winner declared and prize transferred successfully!');
        } catch (error: any) {
            const message = error.response?.data?.error || error.message || 'Failed to declare winner';
            alert(message);
        }
    },

    cancelTournament: async (tournamentId: string) => {
        try {
            const response = await api.post('/cancel/cancel', { tournamentId });
            get().fetchTournaments();
            get().fetchUsers();
            get().fetchTransactions(); // Refresh transactions to show refunds
            alert(`Tournament cancelled! ${response.data.refundedParticipants} participants refunded ₹${response.data.refundAmount} each.`);
        } catch (error: any) {
            const message = error.response?.data?.error || error.message || 'Failed to cancel tournament';
            alert(message);
        }
    },

    deleteTournament: async (id: string) => {
        try {
            await api.delete(`/tournaments/${id}`);
            get().fetchTournaments();
            alert('Tournament deleted successfully!');
        } catch (error: any) {
            const message = error.response?.data?.error || error.message || 'Failed to delete tournament';
            alert(message);
        }
    },

    approveTransaction: async (transactionId) => {
        try {
            await api.put(`/transactions/${transactionId}/approve`);
            get().fetchTransactions();
            get().fetchUsers();
        } catch (error: any) {
            const message = error.response?.data?.error || error.message || "Failed to approve transaction";
            alert(message);
        }
    },

    rejectTransaction: async (transactionId) => {
        try {
            await api.put(`/transactions/${transactionId}/reject`);
            get().fetchTransactions();
            get().fetchUsers();
        } catch (error: any) {
            const message = error.response?.data?.error || error.message || "Failed to reject transaction";
            alert(message);
        }
    },
}));
