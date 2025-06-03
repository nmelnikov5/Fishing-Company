import express from 'express';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const router = express.Router();
const prisma = new PrismaClient();

// Получить все виды рыбы
router.get('/types', async (req, res) => {
  try {
    const fishTypes = await prisma.fishType.findMany({
      include: {
        fishCatches: true
      }
    });

    // Добавляем общий вес для каждого вида рыбы
    const fishTypesWithTotalWeight = fishTypes.map(fishType => ({
      ...fishType,
      totalWeight: fishType.fishCatches.reduce((sum, catch_) => sum + catch_.weight, 0)
    }));

    res.json(fishTypesWithTotalWeight);
  } catch (error) {
    console.error('Error fetching fish types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Создать новый вид рыбы
router.post('/types', async (req, res) => {
  try {
    const { name } = req.body;
    const fishType = await prisma.fishType.create({
      data: { name },
    });
    res.json(fishType);
  } catch (error) {
    console.error('Error creating fish type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Обновить вид рыбы
router.put('/types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const fishType = await prisma.fishType.update({
      where: { id: Number(id) },
      data: { name },
    });
    res.json(fishType);
  } catch (error) {
    console.error('Error updating fish type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Удалить вид рыбы
router.delete('/types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.fishType.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting fish type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить вид рыбы по ID
router.get('/types/:id', async (req: Request, res: Response) => {
  try {
    const fishType = await prisma.fishType.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        fishCatches: {
          include: {
            bankVisit: {
              include: {
                fishingTrip: {
                  include: {
                    boat: true
                  }
                },
                fishingBank: true
              }
            }
          }
        }
      }
    });

    if (!fishType) {
      return res.status(404).json({ error: 'Вид рыбы не найден' });
    }

    // Вычисляем общий вес улова
    const totalWeight = fishType.fishCatches.reduce((sum, catch_) => sum + catch_.weight, 0);

    res.json({
      ...fishType,
      totalWeight
    });
  } catch (error) {
    console.error('Ошибка при получении вида рыбы:', error);
    res.status(500).json({ error: 'Ошибка при получении вида рыбы' });
  }
});

// Get catches by fish type and bank
router.get('/catches', async (req, res) => {
  try {
    const { fishTypeId, bankId } = req.query;
    const catches = await prisma.fishCatch.findMany({
      where: {
        fishTypeId: parseInt(fishTypeId as string),
        bankVisit: {
          fishingBankId: parseInt(bankId as string)
        }
      },
      include: {
        fishType: true,
        bankVisit: {
          include: {
            fishingTrip: {
              include: {
                boat: true
              }
            },
            fishingBank: true
          }
        }
      }
    });
    res.json(catches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fish catches' });
  }
});

// Get fish catches by date range
router.get('/catches/date-range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const catches = await prisma.fishCatch.findMany({
      where: {
        bankVisit: {
          arrivalDate: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string)
          }
        }
      },
      include: {
        fishType: true,
        bankVisit: {
          include: {
            fishingTrip: {
              include: {
                boat: true
              }
            },
            fishingBank: true
          }
        }
      }
    });
    res.json(catches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fish catches by date range' });
  }
});

// Get fish catches by quality
router.get('/catches/quality/:quality', async (req, res) => {
  try {
    const { quality } = req.params;
    const catches = await prisma.fishCatch.findMany({
      where: {
        quality
      },
      include: {
        fishType: true,
        bankVisit: {
          include: {
            fishingTrip: {
              include: {
                boat: true
              }
            },
            fishingBank: true
          }
        }
      }
    });
    res.json(catches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fish catches by quality' });
  }
});

export default router; 