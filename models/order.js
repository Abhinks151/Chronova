import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  shippingAddress: {
    addressName: { 
      type: String,
      enum: ['Home', 'Work', 'Other'],
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    addressLine: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
    },
  },

  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        required: true,
      },
      productName: {
        type: String,
        required: true,
      },
      brand: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
      },
      category: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Category',
        },
      ],
      image: {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    },
  ],

  paymentMethod: {
    type: String,
    enum: ['COD', 'ONLINE'],
    required: true,
  },

  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending',
  },

  paymentDetails: {
    transactionId: {
      type: String,
    },
    paymentDate: {
      type: Date,
    },
    paymentProvider: {
      type: String,
    },
  },

  coupon: {
    code: {
      type: String,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
  },

  subtotal: {
    type: Number,
    required: true,
  },

  discount: {
    type: Number,
    default: 0,
  },

  totalAmount: {
    type: Number,
    required: true,
  },

  isPaid: {
    type: Boolean,
    default: false,
  },

  orderStatus: {
    type: String,
    enum: ['Pending', 'Placed', 'Cancelled', 'Shipped', 'Delivered', 'Returned'],
    default: 'Placed',
  },
}, {
  timestamps: true,
});

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
