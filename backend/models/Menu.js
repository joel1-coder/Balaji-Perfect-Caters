import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String },
  isAvailable: { type: Boolean, default: true }
});

const MenuSchema = new mongoose.Schema({
  title: { type: String, required: true },
  restaurantName: { type: String, required: true },
  items: [MenuItemSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Menu', MenuSchema);
