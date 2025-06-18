import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  public_id: {
    type: String,
    required: true,
  },
}, { _id: false });

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  brand: {
    type: String,
    required: true,
    trim: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  category: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  productType: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  strapType: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  dialSize: {
    type: Number,
    required: true,
  },
  dialShape: {
    type: String,
    required: true,
  },
  movement: {
    type: String,
    required: true,
  },
  waterResistance: {
    type: String,
    required: true,
  },
  warranty: {
    type: String,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  salePrice: {
    type: Number,
    required: true,
  },
  finalPrice: {
    type: Number,
    default: function () {
      return this.salePrice || this.price;
    },
  },
  stockQuantity: {
    type: Number,
    required: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  images: {
    type: [imageSchema],
    validate: {
      validator: function (arr) {
        return arr.length === 4;
      },
      message: '4 images are required.',
    },
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  review: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
  }],
  hasActiveOffer: {
    type: Boolean,
    default: false,
  },
  appliedDiscountInfo: {
    type: String,
    default: "No discounts applied",
  },
}, {
  timestamps: true,
});

export const Products = mongoose.model('Products', productSchema);

