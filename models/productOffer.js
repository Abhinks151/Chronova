import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'products',
      required: true
    }
  ],
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

export const ProductOffer = mongoose.model('productOffers', offerSchema);
