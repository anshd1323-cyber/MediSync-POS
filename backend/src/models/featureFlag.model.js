const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FeatureFlag = sequelize.define('FeatureFlag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  plan: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['FREE', 'STARTER', 'PRO', 'ENTERPRISE']],
    },
  },
  featureKey: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'feature_flags',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['plan', 'feature_key'] },
  ],
});

module.exports = FeatureFlag;
