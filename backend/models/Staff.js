import mongoose from 'mongoose';

const StaffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  empId: { type: String, required: true, unique: true },
  role: { type: String, required: true }, // e.g., 'Chef', 'Cashier', 'Server'
  shiftTiming: { type: String, required: true }, // e.g., '06:00 AM — 02:00 PM'
  shiftLabel: { type: String }, // e.g., 'Morning Shift'
  status: { type: String, default: 'OFF-DUTY' }, // 'ON-DUTY', 'OFF-DUTY', 'ABSENT'
  rating: { type: Number, default: 0 },
  color: { type: String, default: '#f1f5f9' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Staff', StaffSchema);
