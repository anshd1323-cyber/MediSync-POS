const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define(
  'Invoice',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    consultationId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow direct POS walk-in without a consultation
      field: 'consultation_id',
    },
    clinicId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'clinic_id',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'total_amount',
    },
    paymentStatus: {
      type: DataTypes.ENUM('UNPAID', 'PAID'),
      allowNull: false,
      defaultValue: 'UNPAID',
      field: 'payment_status',
    },
    paymentMethod: {
      type: DataTypes.ENUM('CASH', 'CARD', 'UPI'),
      allowNull: false,
      defaultValue: 'CASH',
      field: 'payment_method',
    },
    taxApplied: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'tax_applied',
    },
  },
  {
    tableName: 'invoices',
    timestamps: true,
  }
);

module.exports = Invoice;
