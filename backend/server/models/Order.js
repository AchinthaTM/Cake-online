const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  sellerId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  items: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const value = this.getDataValue('items');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('items', JSON.stringify(value));
    }
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  deliveryFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  payment: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const value = this.getDataValue('payment');
      return value ? JSON.parse(value) : {};
    },
    set(value) {
      this.setDataValue('payment', JSON.stringify(value));
    }
  },
  delivery: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const value = this.getDataValue('delivery');
      return value ? JSON.parse(value) : {};
    },
    set(value) {
      this.setDataValue('delivery', JSON.stringify(value));
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
}, {
  timestamps: true,
  hooks: {
    beforeValidate: (order) => {
      if (!order.orderNumber) {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        order.orderNumber = `SD${timestamp}${random}`;
      }
    }
  }
});

module.exports = Order;