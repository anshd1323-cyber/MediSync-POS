const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Visit = sequelize.define('Visit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tenantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tokenNo: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'WAITING',
    validate: {
      isIn: [['WAITING', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED']],
    },
  },
  visitDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  vitals: {
    type: DataTypes.TEXT, // JSON string — use JSONB with PostgreSQL
    defaultValue: '{}',
    get() {
      const raw = this.getDataValue('vitals');
      try { return JSON.parse(raw); } catch { return {}; }
    },
    set(val) {
      this.setDataValue('vitals', typeof val === 'string' ? val : JSON.stringify(val));
    },
  },
  notes: {
    type: DataTypes.TEXT,
  },
  diagnosis: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'visits',
  indexes: [
    { unique: true, fields: ['tenant_id', 'visit_date', 'token_no'] },
  ],
});

module.exports = Visit;
