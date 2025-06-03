import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all crew members
router.get('/', async (req, res) => {
  try {
    const crewMembers = await prisma.crewMember.findMany();
    res.json(crewMembers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch crew members' });
  }
});

// Get crew member by ID
router.get('/:id', async (req, res) => {
  try {
    const crewMember = await prisma.crewMember.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!crewMember) {
      return res.status(404).json({ error: 'Crew member not found' });
    }
    res.json(crewMember);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch crew member' });
  }
});

// Create new crew member
router.post('/', async (req, res) => {
  try {
    const { name, address, position } = req.body;
    const crewMember = await prisma.crewMember.create({
      data: {
        name,
        address,
        position
      }
    });
    res.status(201).json(crewMember);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create crew member' });
  }
});

// Update crew member
router.put('/:id', async (req, res) => {
  try {
    const { name, address, position } = req.body;
    const crewMember = await prisma.crewMember.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name,
        address,
        position
      }
    });
    res.json(crewMember);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update crew member' });
  }
});

// Delete crew member
router.delete('/:id', async (req, res) => {
  try {
    await prisma.crewMember.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete crew member' });
  }
});

// Get crew member's fishing trips
router.get('/:id/trips', async (req, res) => {
  try {
    const crewMember = await prisma.crewMember.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        fishingTrips: {
          include: {
            boat: true,
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
    if (!crewMember) {
      return res.status(404).json({ error: 'Crew member not found' });
    }
    res.json(crewMember.fishingTrips);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch crew member trips' });
  }
});

export default router; 