import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET all trips
router.get('/', async (req, res) => {
    try {
        const trips = await prisma.fishingTrip.findMany({
            include: {
                boat: true,
                crewMembers: true,
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
        });
        res.json(trips);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch trips' });
    }
});

// GET trip by ID
router.get('/:id', async (req, res) => {
    try {
        const trip = await prisma.fishingTrip.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                boat: true,
                crewMembers: true,
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
        });
        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }
        res.json(trip);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch trip' });
    }
});

// POST new trip
router.post('/', async (req, res) => {
    try {
        const { boatId, crewMemberIds, departureDate, returnDate, bankVisits } = req.body;
        
        // Создаем поездку
        const trip = await prisma.fishingTrip.create({
            data: {
                boatId: parseInt(boatId),
                departureDate: new Date(departureDate),
                returnDate: new Date(returnDate),
                crewMembers: {
                    connect: crewMemberIds.map((id: string) => ({ id: parseInt(id) }))
                },
                bankVisits: {
                    create: bankVisits.map((visit: any) => ({
                        fishingBankId: parseInt(visit.fishingBankId),
                        arrivalDate: new Date(visit.arrivalDate),
                        departureDate: new Date(visit.departureDate),
                        fishCatches: {
                            create: visit.fishCatches.map((catch_: any) => ({
                                fishTypeId: parseInt(catch_.fishTypeId),
                                weight: parseFloat(catch_.weight),
                                quality: catch_.quality
                            }))
                        }
                    }))
                }
            },
            include: {
                boat: true,
                crewMembers: true,
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
        });
        res.status(201).json(trip);
    } catch (error) {
        console.error('Error creating trip:', error);
        res.status(500).json({ error: 'Failed to create trip' });
    }
});

// PUT update trip
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { boatId, crewMemberIds, departureDate, returnDate, bankVisits } = req.body;

        // Сначала удаляем все существующие посещения банков и уловы
        await prisma.fishCatch.deleteMany({
            where: {
                bankVisit: {
                    fishingTripId: parseInt(id)
                }
            }
        });
        await prisma.bankVisit.deleteMany({
            where: {
                fishingTripId: parseInt(id)
            }
        });

        // Обновляем поездку
        const trip = await prisma.fishingTrip.update({
            where: { id: parseInt(id) },
            data: {
                boatId: parseInt(boatId),
                departureDate: new Date(departureDate),
                returnDate: new Date(returnDate),
                crewMembers: {
                    set: crewMemberIds.map((id: string) => ({ id: parseInt(id) }))
                },
                bankVisits: {
                    create: bankVisits.map((visit: any) => ({
                        fishingBankId: parseInt(visit.fishingBankId),
                        arrivalDate: new Date(visit.arrivalDate),
                        departureDate: new Date(visit.departureDate),
                        fishCatches: {
                            create: visit.fishCatches.map((catch_: any) => ({
                                fishTypeId: parseInt(catch_.fishTypeId),
                                weight: parseFloat(catch_.weight),
                                quality: catch_.quality
                            }))
                        }
                    }))
                }
            },
            include: {
                boat: true,
                crewMembers: true,
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
        });
        res.json(trip);
    } catch (error) {
        console.error('Error updating trip:', error);
        res.status(500).json({ error: 'Failed to update trip' });
    }
});

// DELETE trip
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.fishingTrip.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Trip deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete trip' });
    }
});

export default router; 