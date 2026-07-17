const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tenantId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  entityType: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  entityId: {
    type: DataTypes.INTEGER,
  },
  details: {
    type: DataTypes.TEXT, // JSON string
    defaultValue: '{}',
    get() {
      const raw = this.getDataValue('details');
      try { return JSON.parse(raw); } catch { return {}; }
    },
    set(val) {
      this.setDataValue('details', typeof val === 'string' ? val : JSON.stringify(val));
    },
  },
  ipAddress: {
    type: DataTypes.STRING(45),
  },
}, {
  tableName: 'audit_logs',
  updatedAt: false,
});

module.exports = AuditLog;
