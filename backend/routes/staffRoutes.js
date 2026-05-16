import express from 'express';
import Staff from '../models/Staff.js';

const router = express.Router();

// GET all staff
router.get('/', async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.json({ success: true, data: staff });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST new staff
router.post('/', async (req, res) => {
  try {
    // Generate initials colors randomly
    const colors = ['#dbeafe', '#f3e8ff', '#dcfce7', '#ffedd5'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const staff = new Staff({ ...req.body, color: randomColor });
    await staff.save();
    res.status(201).json({ success: true, data: staff });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, error: 'Employee ID already exists' });
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT update staff
router.put('/:id', async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: staff });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, error: 'Employee ID already exists' });
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE staff
router.delete('/:id', async (req, res) => {
  try {
    await Staff.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Staff deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// SEED demo staff
router.post('/seed', async (req, res) => {
  try {
    await Staff.deleteMany({});
    const initialStaff = [
      { name: 'Julianna Doe', empId: 'emp-9821', role: 'Chef', shiftTiming: '06:00 AM - 02:00 PM', shiftLabel: 'Morning Shift', status: 'ON-DUTY', rating: 4.8, color: '#dbeafe' },
      { name: 'Marcus Sterling', empId: 'emp-4420', role: 'Cashier', shiftTiming: '11:00 AM - 07:00 PM', shiftLabel: 'General Shift', status: 'ON-DUTY', rating: 4.5, color: '#f3e8ff' },
      { name: 'Aisha Lewis', empId: 'emp-7712', role: 'Server', shiftTiming: '02:00 PM - 10:00 PM', shiftLabel: 'Evening Shift', status: 'OFF-DUTY', rating: 4.9, color: '#dcfce7' },
      { name: 'Robert King', empId: 'emp-2104', role: 'Chef', shiftTiming: '06:00 AM - 02:00 PM', shiftLabel: 'Morning Shift', status: 'ABSENT', rating: 3.2, color: '#fee2e2' },
    ];
    await Staff.insertMany(initialStaff);
    res.status(201).json({ success: true, message: 'Seeded demo staff' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
