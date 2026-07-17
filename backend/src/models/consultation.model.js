const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Consultation = sequelize.define(
  'Consultation',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'patient_id',
    },
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'doctor_id',
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'scheduled_at',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '{}',
    },
    paymentStatus: {
      type: DataTypes.ENUM('UNPAID', 'PAID'),
      allowNull: false,
      defaultValue: 'UNPAID',
      field: 'payment_status',
    },
    fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 15.00,
    },
  },
  {
    tableName: 'consultations',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
);

module.exports = Consultation;
