import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import substituteRoutes from './routes/substituteRoutes.js';
import compensationRoutes from './routes/compensationRoutes.js';
import balanceRoutes from './routes/balanceRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/substitute', substituteRoutes);
app.use('/api/compensation', compensationRoutes);
app.use('/api/balance', balanceRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
