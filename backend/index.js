import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import menuRoutes from './routes/menuRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import discountRoutes from './routes/discountRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

import { MongoMemoryServer } from 'mongodb-memory-server';

// MongoDB Connection with Auto-Fallback
const connectDB = async () => {
  try {
    // Try to connect to Atlas with a 10-second timeout
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ MongoDB Connected (Atlas)');
  } catch (err) {
    console.log('⚠️ Atlas Connection Failed. Starting local temporary memory database...');
    try {
      const mongoServer = await MongoMemoryServer.create();
      const memUri = mongoServer.getUri();
      await mongoose.connect(memUri);
      console.log('✅ Local Memory DB Connected! (Data will reset on restart)');
    } catch (memErr) {
      console.error('❌ Memory DB Error:', memErr);
    }
  }
};
connectDB();

// Routes
app.use('/api/menus', menuRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/discounts', discountRoutes);

app.get('/', (req, res) => res.send('Canteen API is running...'));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
