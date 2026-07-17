const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tenantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
  },
  gender: {
    type: DataTypes.STRING(10),
    validate: {
      isIn: [['MALE', 'FEMALE', 'OTHER']],
    },
  },
  address: {
    type: DataTypes.TEXT,
  },
  bloodGroup: {
    type: DataTypes.STRING(5),
  },
  emergencyContact: {
    type: DataTypes.STRING(20),
  },
  medicalHistory: {
    type: DataTypes.TEXT, // JSON string — use JSONB with PostgreSQL
    defaultValue: '{}',
    get() {
      const raw = this.getDataValue('medicalHistory');
      try { return JSON.parse(raw); } catch { return {}; }
    },
    set(val) {
      this.setDataValue('medicalHistory', typeof val === 'string' ? val : JSON.stringify(val));
    },
  },
}, {
  tableName: 'patients',
  indexes: [
    { unique: true, fields: ['tenant_id', 'phone'] },
  ],
});

module.exports = Patient;
