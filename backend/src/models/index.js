const sequelize = require('../config/database');
const User = require('./user.model');
const DoctorProfile = require('./doctorProfile.model');
const Consultation = require('./consultation.model');
const Message = require('./message.model');
const DoctorAvailability = require('./doctorAvailability.model');
const Clinic = require('./clinic.model');
const Invoice = require('./invoice.model');
const InvoiceItem = require('./invoiceItem.model');

// Clinic Relationships
Clinic.hasMany(User, { foreignKey: 'clinicId', as: 'doctors' });
User.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });

Clinic.hasMany(Invoice, { foreignKey: 'clinicId', as: 'invoices' });
Invoice.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });

// Doctor/Profile Relationships
User.hasOne(DoctorProfile, { foreignKey: 'userId', as: 'doctorProfile' });
DoctorProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Consultation Relationships
User.hasMany(Consultation, { foreignKey: 'patientId', as: 'consultationsAsPatient' });
User.hasMany(Consultation, { foreignKey: 'doctorId', as: 'consultationsAsDoctor' });
Consultation.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Consultation.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

Consultation.hasMany(Message, { foreignKey: 'consultationId', as: 'messages', onDelete: 'CASCADE' });
Message.belongsTo(Consultation, { foreignKey: 'consultationId', as: 'consultation' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

User.hasMany(DoctorAvailability, { foreignKey: 'doctorId', as: 'availabilities' });
DoctorAvailability.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

// Invoice Relationships
Invoice.hasMany(InvoiceItem, { foreignKey: 'invoiceId', as: 'items', onDelete: 'CASCADE' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

Consultation.hasOne(Invoice, { foreignKey: 'consultationId', as: 'invoice' });
Invoice.belongsTo(Consultation, { foreignKey: 'consultationId', as: 'consultation' });

module.exports = {
  sequelize,
  User,
  DoctorProfile,
  Consultation,
  Message,
  DoctorAvailability,
  Clinic,
  Invoice,
  InvoiceItem,
};
