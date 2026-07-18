const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define(
  'Product',
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'stock_quantity',
    },
    lowStockThreshold: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      field: 'low_stock_threshold',
    },
    scheduleClass: {
      type: DataTypes.ENUM('OTC', 'H', 'H1', 'X'),
      allowNull: true,
      field: 'schedule_class',
    },
  },
  {
    tableName: 'products',
    timestamps: true,
  }
);

module.exports = Product;
