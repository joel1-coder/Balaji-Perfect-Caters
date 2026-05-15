import express from 'express';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// GET all transactions (for Audit)
router.get('/', async (req, res) => {
  try {
    const txns = await Transaction.find().sort({ createdAt: -1 });
    res.json({ success: true, data: txns });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create transaction
router.post('/', async (req, res) => {
  try {
    const txn = new Transaction(req.body);
    await txn.save();
    res.status(201).json({ success: true, data: txn });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE transaction
router.delete('/:id', async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH update payment status
router.patch('/:id/status', async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const allowed = ['paid', 'unpaid', 'pending', 'disputed'];
    if (!allowed.includes(paymentStatus)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    const txn = await Transaction.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );
    if (!txn) return res.status(404).json({ success: false, error: 'Transaction not found' });
    res.json({ success: true, data: txn });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
