import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get fish catch statistics by fish type and boat
router.get('/fish-catch', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    console.log('Received request with dates:', { startDate, endDate });

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    console.log('Parsed dates:', { start, end });

    const fishCatchStats = await prisma.$queryRaw`
      SELECT 
        ft.id as "fishTypeId",
        ft.name as "fishTypeName",
        b.id as "boatId",
        b.name as "boatName",
        SUM(fc.weight) as "totalCatch"
      FROM "FishCatch" fc
      JOIN "BankVisit" bv ON fc."bankVisitId" = bv.id
      JOIN "FishingTrip" ftr ON bv."fishingTripId" = ftr.id
      JOIN "Boat" b ON ftr."boatId" = b.id
      JOIN "FishType" ft ON fc."fishTypeId" = ft.id
      WHERE ftr."departureDate" >= ${start}
      AND ftr."returnDate" <= ${end}
      GROUP BY ft.id, ft.name, b.id, b.name
      ORDER BY ft.name, "totalCatch" DESC
    `;

    // Transform the data to match the expected format
    const transformedStats = fishCatchStats.map((stat: any) => ({
      fishType: {
        id: stat.fishTypeId,
        name: stat.fishTypeName
      },
      boat: {
        id: stat.boatId,
        name: stat.boatName
      },
      totalCatch: Number(stat.totalCatch)
    }));

    console.log('Query result:', transformedStats);
    res.json(transformedStats);
  } catch (error) {
    console.error('Detailed error in fish-catch:', {
      message: error.message,
      stack: error.stack,
      error
    });
    res.status(500).json({ 
      error: 'Failed to fetch fish catch statistics', 
      details: error.message,
      stack: error.stack
    });
  }
});

// Get average catch statistics by bank
router.get('/bank-catch', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    console.log('Received request with dates:', { startDate, endDate });

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    console.log('Parsed dates:', { start, end });

    const bankStats = await prisma.$queryRaw`
      SELECT 
        fb.id as "bankId",
        fb.name as "bankName",
        COALESCE(AVG(fc.weight), 0) as "averageCatch"
      FROM "FishingBank" fb
      LEFT JOIN "BankVisit" bv ON fb.id = bv."fishingBankId"
      LEFT JOIN "FishingTrip" ft ON bv."fishingTripId" = ft.id
      LEFT JOIN "FishCatch" fc ON bv.id = fc."bankVisitId"
      WHERE (ft."departureDate" IS NULL OR ft."departureDate" >= ${start})
      AND (ft."returnDate" IS NULL OR ft."returnDate" <= ${end})
      GROUP BY fb.id, fb.name
      ORDER BY fb.name
    `;

    // Transform the data to match the expected format
    const transformedStats = bankStats.map((stat: any) => ({
      bank: {
        id: stat.bankId,
        name: stat.bankName
      },
      averageCatch: Number(stat.averageCatch)
    }));

    console.log('Query result:', transformedStats);
    res.json(transformedStats);
  } catch (error) {
    console.error('Detailed error in bank-catch:', {
      message: error.message,
      stack: error.stack,
      error
    });
    res.status(500).json({ 
      error: 'Failed to fetch bank catch statistics', 
      details: error.message,
      stack: error.stack
    });
  }
});

export default router; 