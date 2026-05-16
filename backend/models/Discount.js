import mongoose from 'mongoose';

const DiscountItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'Student Offer' },
  originalPrice: { type: Number, required: true },
  discountedPrice: { type: Number, required: true },
  badge: { type: String, default: 'Special' },
  isActive: { type: Boolean, default: true },
}, { _id: true });

const DiscountSchema = new mongoose.Schema({
  title: { type: String, default: 'Student Discount Offers' },
  subtitle: { type: String, default: 'Fresh offers available today at Balaji Perfect Caters.' },
  validUntil: { type: String, default: '' },
  isPublished: { type: Boolean, default: true },
  items: [DiscountItemSchema],
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

DiscountSchema.pre('save', function updateTimestamp(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Discount', DiscountSchema);
