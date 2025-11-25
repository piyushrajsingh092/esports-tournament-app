import { Request, Response } from 'express';
import { prisma } from '../index';

// Submit tournament results with ranks and kills
export const submitResults = async (req: Request, res: Response) => {
    const { id } = req.params; // tournament id
    const { results } = req.body; // Array of { userId, rank, kills }

    try {
        // Get tournament details
        const tournament = await prisma.tournaments.findUnique({
            where: { id },
            include: {
                prize_distributions: true
            }
        });

        if (!tournament) {
            return res.status(404).json({ error: 'Tournament not found' });
        }

        if (tournament.status !== 'ongoing' && tournament.status !== 'completed') {
            return res.status(400).json({ error: 'Tournament must be ongoing or completed to submit results' });
        }

        // Calculate prizes for each player
        const resultsWithPrizes = results.map((result: { userId: string; rank: number; kills: number }) => {
            let prizeWon = 0;

            // Add rank-based prize if configured
            const rankPrize = tournament.prize_distributions.find(pd => pd.rank === result.rank);
            if (rankPrize) {
                prizeWon += Number(rankPrize.prize_amount);
            }

            // Add per-kill rewards if configured
            if (tournament.per_kill_reward) {
                prizeWon += Number(tournament.per_kill_reward) * result.kills;
            }

            return {
                tournament_id: id,
                user_id: result.userId,
                rank: result.rank,
                kills: result.kills,
                prize_won: prizeWon
            };
        });

        // Create tournament results and distribute prizes in a transaction
        await prisma.$transaction(async (tx) => {
            // Delete existing results if any (for re-submission)
            await tx.tournament_results.deleteMany({
                where: { tournament_id: id }
            });

            // Create new results
            await tx.tournament_results.createMany({
                data: resultsWithPrizes
            });

            // Distribute prizes to winners
            for (const result of resultsWithPrizes) {
                if (result.prize_won > 0) {
                    // Add prize to user's balance
                    await tx.profiles.update({
                        where: { id: result.user_id },
                        data: { balance: { increment: result.prize_won } }
                    });

                    // Create transaction record
                    await tx.transactions.create({
                        data: {
                            user_id: result.user_id,
                            type: 'prize',
                            amount: result.prize_won,
                            status: 'approved',
                            upi_ref: `PRIZE-${tournament.title.substring(0, 10)}-RANK${result.rank}-${Date.now()}`
                        }
                    });
                }
            }

            // Update tournament status to completed
            await tx.tournaments.update({
                where: { id },
                data: { status: 'completed' }
            });
        });

        res.json({
            message: 'Results submitted and prizes distributed successfully',
            results: resultsWithPrizes
        });
    } catch (error: any) {
        console.error('Submit Results Error:', error);
        res.status(400).json({ error: error.message });
    }
};

// Get tournament results
export const getResults = async (req: Request, res: Response) => {
    const { id } = req.params; // tournament id

    try {
        const results = await prisma.tournament_results.findMany({
            where: { tournament_id: id },
            include: {
                profiles: {
                    select: {
                        username: true,
                        email: true
                    }
                }
            },
            orderBy: { rank: 'asc' }
        });

        res.json(results);
    } catch (error: any) {
        console.error('Get Results Error:', error);
        res.status(500).json({ error: error.message });
    }
};
