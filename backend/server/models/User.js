const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: function() {
      return !this.isGoogleUser;
    }
  },
  isGoogleUser: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  role: {
    type: DataTypes.ENUM('buyer', 'seller', 'admin'),
    defaultValue: 'buyer'
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('address');
      return value ? JSON.parse(value) : null;
    },
    set(value) {
      this.setDataValue('address', JSON.stringify(value));
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  otpCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  otpExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  otpType: {
    type: DataTypes.ENUM('login', 'email_verification', 'password_reset'),
    defaultValue: 'login'
  },
  profileImage: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  bankDetails: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('bankDetails');
      return value ? JSON.parse(value) : null;
    },
    set(value) {
      this.setDataValue('bankDetails', JSON.stringify(value));
    }
  },
  sellerInfo: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('sellerInfo');
      return value ? JSON.parse(value) : null;
    },
    set(value) {
      this.setDataValue('sellerInfo', JSON.stringify(value));
    }
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetPasswordExpire: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Compare password method
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
