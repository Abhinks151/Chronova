import mongoose from 'mongoose';

const stockRegistrySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: String,
  action: {
    type: String,
    enum: ['stock_in', 'stock_out'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  previousStock: Number,
  newStock: Number,
  reason: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String, 
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export const stockRegistry =  mongoose.model('StockRegistry', stockRegistrySchema);
