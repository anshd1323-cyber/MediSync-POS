const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Prescription = sequelize.define('Prescription', {
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
    allowNull: false,
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  medicines: {
    type: DataTypes.TEXT, // JSON string — use JSONB with PostgreSQL
    allowNull: false,
    defaultValue: '[]',
    get() {
      const raw = this.getDataValue('medicines');
      try { return JSON.parse(raw); } catch { return []; }
    },
    set(val) {
      this.setDataValue('medicines', typeof val === 'string' ? val : JSON.stringify(val));
    },
  },
  notes: {
    type: DataTypes.TEXT,
  },
  pdfUrl: {
    type: DataTypes.STRING(500),
  },
}, {
  tableName: 'prescriptions',
  updatedAt: false,
});

module.exports = Prescription;
