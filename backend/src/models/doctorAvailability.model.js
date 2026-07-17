const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DoctorAvailability = sequelize.define('DoctorAvailability', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  dayOfWeek: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '0=Sunday, 1=Monday, ..., 6=Saturday'
  },
  startTime: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'HH:mm format e.g. 09:00'
  },
  endTime: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'HH:mm format e.g. 17:00'
  },
  slotDuration: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    comment: 'Duration in minutes'
  },
  bufferTime: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    comment: 'Buffer/break duration in minutes'
  }
}, {
  tableName: 'doctor_availability',
  timestamps: true,
});

module.exports = DoctorAvailability;
