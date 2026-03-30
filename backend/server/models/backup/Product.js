const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Chocolate', 'Vanilla', 'Strawberry', 'Red Velvet', 'Butter', 'Fruit', 'Bouquet', 'Other'],
    default: 'Chocolate'
  },
  type: {
    type: String,
    enum: ['cake', 'bouquet'],
    default: 'cake'
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    }
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller is required']
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  weight: {
    type: Number, // in grams
    min: [0, 'Weight cannot be negative']
  },
  servings: {
    type: Number,
    min: [1, 'Must serve at least 1 person']
  },
  allergens: [{
    type: String,
    enum: ['nuts', 'dairy', 'eggs', 'gluten', 'soy', 'other']
  }],
  preparationTime: {
    type: Number, // in hours
    min: [0, 'Preparation time cannot be negative']
  },
  customization: {
    available: {
      type: Boolean,
      default: false
    },
    options: [{
      name: String,
      type: {
        type: String,
        enum: ['text', 'select', 'color']
      },
      required: Boolean,
      choices: [String] // for select type
    }]
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ category: 1, type: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ name: 'text', description: 'text' }); // Text search

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock < 5) return 'low_stock';
  return 'in_stock';
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);