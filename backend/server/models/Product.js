const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('cake', 'bouquet'),
    defaultValue: 'cake'
  },
  images: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('images');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('images', JSON.stringify(value));
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  tags: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('tags');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('tags', JSON.stringify(value));
    }
  },
  weight: {
    type: DataTypes.INTEGER, // in grams
    allowNull: true
  },
  servings: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  allergens: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('allergens');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('allergens', JSON.stringify(value));
    }
  },
  preparationTime: {
    type: DataTypes.INTEGER, // in hours
    allowNull: true
  },
  customization: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('customization');
      return value ? JSON.parse(value) : null;
    },
    set(value) {
      this.setDataValue('customization', JSON.stringify(value));
    }
  },
  ratings: {
    type: DataTypes.TEXT,
    defaultValue: JSON.stringify({ average: 0, count: 0 }),
    get() {
      const value = this.getDataValue('ratings');
      return value ? JSON.parse(value) : { average: 0, count: 0 };
    },
    set(value) {
      this.setDataValue('ratings', JSON.stringify(value));
    }
  },
  reviews: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('reviews');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('reviews', JSON.stringify(value));
    }
  },
  sellerId: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Product;