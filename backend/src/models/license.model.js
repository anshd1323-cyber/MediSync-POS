const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const License = sequelize.define('License', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tenantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  plan: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'FREE',
    validate: {
      isIn: [['FREE', 'STARTER', 'PRO', 'ENTERPRISE']],
    },
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'TRIAL',
    validate: {
      isIn: [['ACTIVE', 'TRIAL', 'EXPIRED', 'SUSPENDED', 'GRACE_PERIOD']],
    },
  },
  trialEnd: {
    type: DataTypes.DATE,
  },
  renewalDate: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'licenses',
});

module.exports = License;
