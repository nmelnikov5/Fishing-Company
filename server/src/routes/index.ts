import express from 'express';
import boatRoutes from './boats';
import tripRoutes from './trips';
import bankRoutes from './banks';
import crewRoutes from './crew';
import fishRoutes from './fish';
import statisticsRoutes from './statistics';

const router = express.Router();

router.use('/boats', boatRoutes);
router.use('/trips', tripRoutes);
router.use('/banks', bankRoutes);
router.use('/crew', crewRoutes);
router.use('/fish', fishRoutes);
router.use('/statistics', statisticsRoutes);

export default router; 