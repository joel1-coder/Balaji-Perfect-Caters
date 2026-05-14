import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerId: { type: String },
  department: { type: String },
  items: [{
    name: String,
    qty: Number,
    rate: Number,
    total: Number
  }],
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'paid' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Transaction', TransactionSchema);
