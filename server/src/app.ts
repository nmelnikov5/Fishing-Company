import express from 'express';
import cors from 'cors';
import boatsRouter from './routes/boats';
import tripsRouter from './routes/trips';
import banksRouter from './routes/banks';
import crewRouter from './routes/crew';
import fishRouter from './routes/fish';
import statisticsRouter from './routes/statistics';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/boats', boatsRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/banks', banksRouter);
app.use('/api/crew', crewRouter);
app.use('/api/fish', fishRouter);
app.use('/api/statistics', statisticsRouter);

export default app; 