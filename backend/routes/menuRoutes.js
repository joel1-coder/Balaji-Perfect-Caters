import express from 'express';
import Menu from '../models/Menu.js';

const router = express.Router();

// ── Seed Demo Data (MUST be before /:id routes) ───────────────
router.post('/seed', async (req, res) => {
  try {
    await Menu.deleteMany({});
    const menu = new Menu({
      title: 'Daily Menu',
      restaurantName: 'Canteen HQ',
      items: [
        { name: 'Vegetable Samosa', category: 'Snacks', price: 15, description: 'Crispy pastry filled with spiced potatoes', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200' },
        { name: 'Classic Masala Chai', category: 'Tea', price: 10, description: 'Traditional brewed tea with ginger and cardamom', image: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=200' },
        { name: 'Fresh Orange Juice', category: 'Juice', price: 30, description: 'Freshly squeezed orange juice', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200' },
        { name: 'Idli Sambar', category: 'Breakfast', price: 40, description: 'Soft steamed rice cakes served with sambar', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200' },
        { name: 'Veg Biryani', category: 'Lunch', price: 80, description: 'Fragrant basmati rice with mixed vegetables', image: 'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=200' },
      ]
    });
    await menu.save();
    res.status(201).json({ success: true, data: menu });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ── Menu CRUD ─────────────────────────────────────────────────

// GET all menus
router.get('/', async (req, res) => {
  try {
    const menus = await Menu.find().sort({ createdAt: -1 });
    res.json({ success: true, data: menus });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single menu
router.get('/:id', async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });
    res.json({ success: true, data: menu });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create menu
router.post('/', async (req, res) => {
  try {
    const menu = new Menu(req.body);
    await menu.save();
    res.status(201).json({ success: true, data: menu });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT update menu
router.put('/:id', async (req, res) => {
  try {
    const menu = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });
    res.json({ success: true, data: menu });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE menu
router.delete('/:id', async (req, res) => {
  try {
    await Menu.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Menu deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Item CRUD (within a menu) ─────────────────────────────────

// POST add item to menu
router.post('/:menuId/items', async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.menuId);
    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });
    menu.items.push(req.body);
    await menu.save();
    res.status(201).json({ success: true, data: menu });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT update item in menu
router.put('/:menuId/items/:itemId', async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.menuId);
    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });
    const item = menu.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    Object.assign(item, req.body);
    await menu.save();
    res.json({ success: true, data: menu });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE item from menu
router.delete('/:menuId/items/:itemId', async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.menuId);
    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });
    menu.items.pull({ _id: req.params.itemId });
    await menu.save();
    res.json({ success: true, data: menu });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
