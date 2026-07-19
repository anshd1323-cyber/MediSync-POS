const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PrescriptionItem = sequelize.define(
  'PrescriptionItem',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clinicId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'clinic_id',
    },
    prescriptionId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'prescription_id',
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'product_id',
    },
    dosage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    frequency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    durationDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'duration_days',
    },
    substitutionAllowed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'substitution_allowed',
    },
    scheduleClass: {
      type: DataTypes.ENUM('OTC', 'H', 'H1', 'X'),
      allowNull: true,
      field: 'schedule_class',
    },
    quantityPrescribed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'quantity_prescribed',
    },
    quantityDispensed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'quantity_dispensed',
    },
  },
  {
    tableName: 'prescription_items',
    timestamps: true,
  }
);

module.exports = PrescriptionItem;
