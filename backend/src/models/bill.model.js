const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bill = sequelize.define('Bill', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tenantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  visitId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  receiptNo: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  lineItems: {
    type: DataTypes.TEXT, // JSON string — use JSONB with PostgreSQL
    allowNull: false,
    defaultValue: '[]',
    get() {
      const raw = this.getDataValue('lineItems');
      try { return JSON.parse(raw); } catch { return []; }
    },
    set(val) {
      this.setDataValue('lineItems', typeof val === 'string' ? val : JSON.stringify(val));
    },
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  paymentMode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'CASH',
    validate: {
      isIn: [['CASH', 'UPI', 'CARD', 'MIXED']],
    },
  },
  paymentStatus: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'PAID',
    validate: {
      isIn: [['PAID', 'PENDING', 'PARTIAL']],
    },
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'bills',
  updatedAt: false,
});

module.exports = Bill;
