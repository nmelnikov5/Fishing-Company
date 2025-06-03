import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET all boats
router.get('/', async (req, res) => {
    try {
        const boats = await prisma.boat.findMany();
        res.json(boats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch boats' });
    }
});

// GET boat by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const boat = await prisma.boat.findUnique({
            where: { id: parseInt(id) },
            include: {
                fishingTrips: {
                    include: {
                        bankVisits: {
                            include: {
                                fishingBank: true,
                                fishCatches: {
                                    include: {
                                        fishType: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!boat) {
            return res.status(404).json({ error: 'Boat not found' });
        }
        res.json(boat);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch boat' });
    }
});

// POST new boat
router.post('/', async (req, res) => {
    try {
        const { name, type, displacement, buildDate } = req.body;
        const boat = await prisma.boat.create({
            data: {
                name,
                type,
                displacement: parseFloat(displacement),
                buildDate: new Date(buildDate)
            }
        });
        res.status(201).json(boat);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create boat' });
    }
});

// PUT update boat
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, displacement, buildDate } = req.body;
        const boat = await prisma.boat.update({
            where: { id: parseInt(id) },
            data: {
                name,
                type,
                displacement: displacement ? parseFloat(displacement) : undefined,
                buildDate: buildDate ? new Date(buildDate) : undefined
            }
        });
        res.json(boat);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update boat' });
    }
});

// DELETE boat
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.boat.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Boat deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete boat' });
    }
});

export default router; 