const sequelize = require('../config/database');
const User = require('./user.model');
const DoctorProfile = require('./doctorProfile.model');
const Consultation = require('./consultation.model');
const Message = require('./message.model');
const DoctorAvailability = require('./doctorAvailability.model');
const Clinic = require('./clinic.model');
const Invoice = require('./invoice.model');
const InvoiceItem = require('./invoiceItem.model');
const Product = require('./product.model');
const CareEpisode = require('./careEpisode.model');
const Prescription = require('./prescription.model');
const PrescriptionItem = require('./prescriptionItem.model');
const AuditLog = require('./auditLog.model');

// ── Clinic Relationships ──────────────────────────────────────────
Clinic.hasMany(Product, { foreignKey: 'clinicId', as: 'products' });
Product.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });

Clinic.hasMany(User, { foreignKey: 'clinicId', as: 'doctors' });
User.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });

Clinic.hasMany(Invoice, { foreignKey: 'clinicId', as: 'invoices' });
Invoice.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });

// ── Doctor/Profile Relationships ──────────────────────────────────
User.hasOne(DoctorProfile, { foreignKey: 'userId', as: 'doctorProfile' });
DoctorProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ── Consultation Relationships ────────────────────────────────────
// NOTE: There is no separate Booking/Appointment model in this codebase.
// Consultation serves as both the booking record and the video-call record.
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

// ── Invoice Relationships ─────────────────────────────────────────
Invoice.hasMany(InvoiceItem, { foreignKey: 'invoiceId', as: 'items', onDelete: 'CASCADE' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

Consultation.hasOne(Invoice, { foreignKey: 'consultationId', as: 'invoice' });
Invoice.belongsTo(Consultation, { foreignKey: 'consultationId', as: 'consultation' });

// Reverse link for CareEpisode.invoiceId (FK lives on CareEpisode, not Invoice —
// invoice.model.js has no careEpisodeId column, so no migration needed here).
Invoice.hasOne(CareEpisode, { foreignKey: 'invoiceId', as: 'careEpisode' });

// ── CareEpisode Relationships ─────────────────────────────────────
CareEpisode.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });
Clinic.hasMany(CareEpisode, { foreignKey: 'clinicId', as: 'careEpisodes' });

CareEpisode.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
User.hasMany(CareEpisode, { foreignKey: 'patientId', as: 'careEpisodesAsPatient' });

CareEpisode.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
User.hasMany(CareEpisode, { foreignKey: 'doctorId', as: 'careEpisodesAsDoctor' });

// bookingId and consultationId both reference Consultation.id (see note above).
// Kept as two distinct FKs since that's how careEpisode.model.js defines them,
// but both will typically hold the same value in this codebase.
CareEpisode.belongsTo(Consultation, { foreignKey: 'bookingId', as: 'booking' });
CareEpisode.belongsTo(Consultation, { foreignKey: 'consultationId', as: 'consultation' });

CareEpisode.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

// Prescription link: single source of truth is Prescription.careEpisodeId
// (removed the competing CareEpisode.belongsTo(Prescription, { foreignKey: 'prescriptionId' })
// association — that column still exists on CareEpisode but should be treated as
// unused/legacy going forward to avoid two records disagreeing on the same relationship).
CareEpisode.hasOne(Prescription, { foreignKey: 'careEpisodeId', as: 'prescriptionRecord' });

// ── Prescription Relationships ────────────────────────────────────
Prescription.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });
Clinic.hasMany(Prescription, { foreignKey: 'clinicId', as: 'prescriptions' });

Prescription.belongsTo(CareEpisode, { foreignKey: 'careEpisodeId', as: 'careEpisode' });

Prescription.belongsTo(Consultation, { foreignKey: 'consultationId', as: 'consultation' });
Prescription.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Prescription.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

// ── PrescriptionItem Relationships ────────────────────────────────
PrescriptionItem.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });
Clinic.hasMany(PrescriptionItem, { foreignKey: 'clinicId', as: 'prescriptionItems' });

PrescriptionItem.belongsTo(Prescription, { foreignKey: 'prescriptionId', as: 'prescription' });
Prescription.hasMany(PrescriptionItem, { foreignKey: 'prescriptionId', as: 'items' });

PrescriptionItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(PrescriptionItem, { foreignKey: 'productId', as: 'prescriptionItems' });

// ── AuditLog Relationships ────────────────────────────────────────
AuditLog.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });
Clinic.hasMany(AuditLog, { foreignKey: 'clinicId', as: 'auditLogs' });

AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });

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
  Product,
  CareEpisode,
  Prescription,
  PrescriptionItem,
  AuditLog,
};