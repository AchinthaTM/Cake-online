const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer is required']
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    customization: {
      type: Map,
      of: String,
      default: {}
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: [0, 'Delivery fee cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  payment: {
    method: {
      type: String,
      enum: ['card', 'bank_transfer', 'cash_on_delivery'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  delivery: {
    address: {
      street: {
        type: String,
        required: [true, 'Street address is required']
      },
      city: {
        type: String,
        required: [true, 'City is required']
      },
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'Sri Lanka'
      }
    },
    instructions: String,
    scheduledDate: {
      type: Date,
      required: [true, 'Delivery date is required']
    },
    timeSlot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      default: 'afternoon'
    },
    deliveredAt: Date,
    trackingNumber: String
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller is required']
  },
  notes: String,
  cancellationReason: String,
  refundAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, status: 1 });
orderSchema.index({ 'delivery.scheduledDate': 1 });

// Pre-validate middleware to generate order number
orderSchema.pre('validate', function() {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.orderNumber = `SD${timestamp}${random}`;
  }
});

// Virtual for order age
orderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60)); // hours
});

// Ensure virtual fields are serialized
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);