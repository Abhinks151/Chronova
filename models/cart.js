import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items:[{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Products',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    }
  }]
},{
  timestamps: true,
})

export const Cart = mongoose.model('Cart', cartSchema);