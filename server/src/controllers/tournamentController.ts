import { Request, Response } from 'express';
import { prisma } from '../index';

export const getTournaments = async (req: Request, res: Response) => {
    try {
        const tournaments = await prisma.tournaments.findMany({
            orderBy: { created_at: 'desc' },
            include: {
                tournament_participants: true,
                prize_distributions: true,
                tournament_results: {
                    include: {
                        profiles: {
                            select: { username: true }
                        }
                    }
                }
            }
        });
        res.json(tournaments);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createTournament = async (req: Request, res: Response) => {
    try {
        const { title, game, entryFee, prizePool, perKillReward, prizeDistribution, startDate, maxPlayers, image, description, rules } = req.body;

        // Create tournament with optional per-kill reward
        const tournament = await prisma.tournaments.create({
            data: {
                title,
                game,
                entry_fee: entryFee,
                prize_pool: prizePool,
                per_kill_reward: perKillReward || null,
                start_date: new Date(startDate),
                max_players: maxPlayers,
                current_players: 0,
                status: 'upcoming',
                image,
                description: description || '',
                rules: rules || ''
            }
        });

        // If prize distribution is provided, create prize distribution records
        if (prizeDistribution && Array.isArray(prizeDistribution) && prizeDistribution.length > 0) {
            await prisma.prize_distributions.createMany({
                data: prizeDistribution.map((pd: { rank: number; amount: number }) => ({
                    tournament_id: tournament.id,
                    rank: pd.rank,
                    prize_amount: pd.amount
                }))
            });
        }

        res.status(201).json(tournament);
    } catch (error: any) {
        console.error('Create Tournament Error:', error);
        res.status(400).json({ error: error.message });
    }
};

export const updateTournament = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const { status, roomId, roomPassword, winnerId } = req.body;

        const updateData: any = {};

        if (status) updateData.status = status;
        if (roomId !== undefined) updateData.room_id = roomId;
        if (roomPassword !== undefined) updateData.room_password = roomPassword;
        if (winnerId !== undefined) updateData.winner_id = winnerId;

        const tournament = await prisma.tournaments.update({
            where: { id },
            data: updateData
        });
        res.json(tournament);
    } catch (error: any) {
        console.error('Update Tournament Error:', error);
        res.status(400).json({ error: error.message });
    }
};

export const joinTournament = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId } = req.body; // In real app, get from token

    try {
        // Check balance
        const tournament = await prisma.tournaments.findUnique({ where: { id } });
        const user = await prisma.profiles.findUnique({ where: { id: userId } });

        if (!tournament || !user) throw new Error("Tournament or User not found");

        if (Number(user.balance) < Number(tournament.entry_fee)) {
            return res.status(400).json({ error: "Insufficient balance" });
        }

        // Transaction: Deduct balance, add participant, record transaction
        await prisma.$transaction([
            prisma.profiles.update({
                where: { id: userId },
                data: { balance: { decrement: tournament.entry_fee } }
            }),
            prisma.tournament_participants.create({
                data: {
                    tournament_id: id,
                    user_id: userId
                }
            }),
            prisma.tournaments.update({
                where: { id },
                data: { current_players: { increment: 1 } }
            }),
            // Record the entry fee as a transaction
            prisma.transactions.create({
                data: {
                    user_id: userId,
                    type: 'tournament_entry',
                    amount: tournament.entry_fee,
                    status: 'approved',
                    upi_ref: `ENTRY-${tournament.title.substring(0, 10)}-${Date.now()}`
                }
            })
        ]);

        res.status(201).json({ message: "Joined tournament successfully" });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteTournament = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // Delete tournament participants first (foreign key constraint)
        await prisma.tournament_participants.deleteMany({
            where: { tournament_id: id }
        });

        // Delete the tournament
        await prisma.tournaments.delete({
            where: { id }
        });

        res.json({ message: 'Tournament deleted successfully' });
    } catch (error: any) {
        console.error('Delete Tournament Error:', error);
        res.status(400).json({ error: error.message });
    }
};
