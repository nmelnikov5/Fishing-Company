import express from 'express';
import { PrismaClient, BankVisit, FishCatch, FishType } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all fishing banks
router.get('/', async (req, res) => {
  try {
    const banks = await prisma.fishingBank.findMany({
      include: {
        bankVisits: {
          include: {
            fishingTrip: {
              include: {
                boat: true
              }
            },
            fishCatches: {
              include: {
                fishType: true
              }
            }
          }
        }
      }
    });
    res.json(banks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fishing banks' });
  }
});

// Get bank by ID
router.get('/:id', async (req, res) => {
  try {
    const bankId = parseInt(req.params.id);
    const bank = await prisma.fishingBank.findUnique({
      where: { id: bankId },
      include: {
        bankVisits: {
          include: {
            fishingTrip: {
              include: {
                boat: true
              }
            },
            fishCatches: {
              include: {
                fishType: true
              }
            }
          }
        }
      }
    });

    if (!bank) {
      return res.status(404).json({ error: 'Fishing bank not found' });
    }

    // Calculate overall average catch per visit for this bank
    const averageCatchResult = await prisma.$queryRaw<{ average_per_visit: number }[]>`
      SELECT AVG(visit_total_catch) as average_per_visit
      FROM (
          SELECT SUM(fc.weight) as visit_total_catch
          FROM "BankVisit" bv
          JOIN "FishCatch" fc ON bv.id = fc."bankVisitId"
          WHERE bv."fishingBankId" = ${bankId}
          GROUP BY bv.id
      ) as visit_catches
    `;

    const overallAverageCatch = averageCatchResult[0]?.average_per_visit || 0;

    res.json({ ...bank, overallAverageCatch });

  } catch (error) {
    console.error('Detailed error fetching bank by ID:', error);
    res.status(500).json({ 
      error: 'Failed to fetch fishing bank',
      details: error.message,
      stack: error.stack
    });
  }
});

// Create new fishing bank
router.post('/', async (req, res) => {
  try {
    const { name, location, description } = req.body;
    console.log('Creating bank with data:', { name, location, description });
    
    const bank = await prisma.fishingBank.create({
      data: {
        name,
        location,
        description
      }
    });
    console.log('Bank created successfully:', bank);
    res.status(201).json(bank);
  } catch (error) {
    console.error('Error creating bank:', error);
    res.status(500).json({ 
      error: 'Failed to create fishing bank',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update fishing bank
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, description } = req.body;
    console.log('Updating bank with data:', { id, name, location, description });
    
    const bank = await prisma.fishingBank.update({
      where: { id: parseInt(id) },
      data: {
        name,
        location,
        description
      }
    });
    console.log('Bank updated successfully:', bank);
    res.json(bank);
  } catch (error) {
    console.error('Error updating bank:', error);
    res.status(500).json({ 
      error: 'Failed to update fishing bank',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete fishing bank
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.fishingBank.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Fishing bank deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete fishing bank' });
  }
});

// Get average catch by bank for date range (by fish type)
router.get('/:id/average-catch', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const bankVisits = await prisma.bankVisit.findMany({
      where: {
        fishingBankId: parseInt(req.params.id),
        arrivalDate: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      },
      include: {
        fishCatches: {
          include: {
            fishType: true
          }
        }
      }
    });

    interface CatchData {
      total: number;
      count: number;
    }

    const averageCatches = bankVisits.reduce((acc: Record<string, CatchData>, visit: BankVisit & { fishCatches: (FishCatch & { fishType: FishType })[] }) => {
      visit.fishCatches.forEach((catch_: FishCatch & { fishType: FishType }) => {
        const fishType = catch_.fishType.name;
        if (!acc[fishType]) {
          acc[fishType] = { total: 0, count: 0 };
        }
        acc[fishType].total += catch_.weight;
        acc[fishType].count += 1;
      });
      return acc;
    }, {});

    const result = Object.entries(averageCatches).map(([fishType, data]) => ({
      fishType,
      averageWeight: data.total / data.count
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate average catch' });
  }
});

// Get boats with above average catch for a bank
router.get('/:id/above-average-boats', async (req, res) => {
  try {
    const bankId = parseInt(req.params.id);

    // Get the overall average catch per visit for this bank
    const averageCatchResult = await prisma.$queryRaw<{ average_per_visit: number }[]>`
      SELECT AVG(visit_total_catch) as average_per_visit
      FROM (
          SELECT SUM(fc.weight) as visit_total_catch
          FROM "BankVisit" bv
          JOIN "FishCatch" fc ON bv.id = fc."bankVisitId"
          WHERE bv."fishingBankId" = ${bankId}
          GROUP BY bv.id
      ) as visit_catches
    `;
    const overallAverageCatchPerVisit = averageCatchResult[0]?.average_per_visit || 0;

    // Find bank visits for this bank that have a total catch greater than the overall average per visit
    const aboveAverageVisits = await prisma.bankVisit.findMany({
      where: {
        fishingBankId: bankId,
      },
      include: {
        fishingTrip: {
          include: {
            boat: true
          }
        },
        fishCatches: true
      },
    });

    // Calculate total catch for each visit and filter those above the average
    const boatsWithAboveAverageCatch = aboveAverageVisits
      .map(visit => ({
        ...visit,
        totalVisitCatch: visit.fishCatches.reduce((sum, catch_) => sum + catch_.weight, 0)
      }))
      .filter(visit => visit.totalVisitCatch > overallAverageCatchPerVisit)
      .map(visit => ({
        boat: visit.fishingTrip.boat,
        averageCatch: visit.totalVisitCatch // Display the total catch for this visit
      }));

    // Remove duplicates and keep the first occurrence of each boat
    const uniqueBoats = Array.from(new Map(boatsWithAboveAverageCatch.map(item => [item.boat.id, item])).values());

    res.json(uniqueBoats);

  } catch (error) {
    console.error('Detailed error fetching above average boats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch above average boats',
      details: error.message,
      stack: error.stack
    });
  }
});

export default router; 