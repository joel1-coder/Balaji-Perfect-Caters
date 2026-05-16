import express from 'express';
import Discount from '../models/Discount.js';

const router = express.Router();

const seedItems = [
  {
    name: 'Student Breakfast Combo',
    description: 'Idli, vada and tea at a friendly student price.',
    category: 'Breakfast',
    originalPrice: 75,
    discountedPrice: 55,
    badge: 'Save Rs. 20',
    isActive: true,
  },
  {
    name: 'Tea and Samosa Pack',
    description: 'A quick snack combo for break time.',
    category: 'Snacks',
    originalPrice: 40,
    discountedPrice: 30,
    badge: 'Popular',
    isActive: true,
  },
  {
    name: 'Lunch Thali Offer',
    description: 'Simple lunch thali offer for students.',
    category: 'Lunch',
    originalPrice: 110,
    discountedPrice: 90,
    badge: 'Student Deal',
    isActive: true,
  },
];

router.post('/seed', async (req, res) => {
  try {
    await Discount.deleteMany({});
    const discount = await Discount.create({
      title: 'Student Discount Offers',
      subtitle: 'Scan, check today offers, and order at the counter.',
      validUntil: '',
      isPublished: true,
      items: seedItems,
    });
    res.status(201).json({ success: true, data: discount });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.get('/active', async (req, res) => {
  try {
    const discount = await Discount.findOne({ isPublished: true }).sort({ updatedAt: -1 });
    res.json({ success: true, data: discount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const discounts = await Discount.find().sort({ updatedAt: -1 });
    res.json({ success: true, data: discounts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);
    if (!discount) return res.status(404).json({ success: false, message: 'Discount page not found' });
    res.json({ success: true, data: discount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const discount = await Discount.create(req.body);
    res.status(201).json({ success: true, data: discount });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const discount = await Discount.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!discount) return res.status(404).json({ success: false, message: 'Discount page not found' });
    res.json({ success: true, data: discount });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Discount.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Discount page deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
