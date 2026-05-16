import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from './models/Transaction.js';

dotenv.config();

const clear = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Transaction.deleteMany({});
    console.log("All transactions deleted.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
clear();
