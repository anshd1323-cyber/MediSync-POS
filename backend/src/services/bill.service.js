const { Bill, Patient, Visit, Tenant } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

/**
 * Generate receipt number: SLUG-YYYYMMDD-SEQ
 */
async function generateReceiptNo(tenantId) {
  const tenant = await Tenant.findByPk(tenantId);
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const slug = (tenant?.slug || 'CLINIC').toUpperCase().slice(0, 10);

  const count = await Bill.count({
    where: {
      tenantId,
      createdAt: {
        [Op.gte]: new Date(new Date().toISOString().split('T')[0]),
      },
    },
  });

  const seq = String(count + 1).padStart(3, '0');
  return `${slug}-${today}-${seq}`;
}

/**
 * Create a new bill.
 */
async function createBill(tenantId, data, userId) {
  // Validate patient
  const patient = await Patient.findOne({ where: { id: data.patientId, tenantId } });
  if (!patient) throw new ApiError(404, 'Patient not found');

  // Validate visit if provided
  if (data.visitId) {
    const visit = await Visit.findOne({ where: { id: data.visitId, tenantId } });
    if (!visit) throw new ApiError(404, 'Visit not found');
  }

  // Calculate totals
  const lineItems = data.lineItems.map(item => ({
    description: item.description,
    type: item.type,
    qty: parseInt(item.qty, 10),
    unitPrice: parseFloat(item.unitPrice),
    amount: parseInt(item.qty, 10) * parseFloat(item.unitPrice),
  }));

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const discount = parseFloat(data.discount || 0);
  const tax = parseFloat(data.tax || 0);
  const total = subtotal - discount + tax;

  const receiptNo = await generateReceiptNo(tenantId);

  const bill = await Bill.create({
    tenantId,
    visitId: data.visitId || null,
    patientId: data.patientId,
    createdBy: userId,
    receiptNo,
    lineItems,
    subtotal,
    discount,
    tax,
    total,
    paymentMode: data.paymentMode || 'CASH',
    paymentStatus: data.paymentStatus || 'PAID',
    notes: data.notes || null,
  });

  await auditService.log({
    tenantId,
    userId,
    action: 'CREATE',
    entityType: 'bill',
    entityId: bill.id,
    details: { receiptNo, total, paymentMode: data.paymentMode },
  });

  return Bill.findByPk(bill.id, {
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'name', 'phone'] },
      { model: Visit, as: 'visit' },
    ],
  });
}

/**
 * Get bills list (filterable by date range).
 */
async function getBills(tenantId, { startDate, endDate, page = 1, limit = 50 }) {
  const where = { tenantId };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt[Op.lte] = end;
    }
  }

  const offset = (page - 1) * limit;
  const { rows, count } = await Bill.findAndCountAll({
    where,
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'name', 'phone'] },
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit, 10),
    offset,
  });

  return {
    bills: rows,
    total: count,
    page: parseInt(page, 10),
    totalPages: Math.ceil(count / limit),
  };
}

/**
 * Get bill by ID.
 */
async function getBillById(tenantId, billId) {
  const bill = await Bill.findOne({
    where: { id: billId, tenantId },
    include: [
      { model: Patient, as: 'patient' },
      { model: Visit, as: 'visit' },
    ],
  });
  if (!bill) throw new ApiError(404, 'Bill not found');
  return bill;
}

/**
 * Get day-end cash reconciliation summary.
 */
async function getDaySummary(tenantId, date) {
  const targetDate = date || new Date().toISOString().split('T')[0];
  const startOfDay = new Date(targetDate);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const bills = await Bill.findAll({
    where: {
      tenantId,
      createdAt: { [Op.between]: [startOfDay, endOfDay] },
      paymentStatus: { [Op.in]: ['PAID', 'PARTIAL'] },
    },
  });

  const summary = {
    date: targetDate,
    totalBills: bills.length,
    totalCollection: 0,
    cash: 0,
    upi: 0,
    card: 0,
    mixed: 0,
    pending: 0,
  };

  for (const bill of bills) {
    const total = parseFloat(bill.total) || 0;
    summary.totalCollection += total;
    switch (bill.paymentMode) {
      case 'CASH': summary.cash += total; break;
      case 'UPI': summary.upi += total; break;
      case 'CARD': summary.card += total; break;
      case 'MIXED': summary.mixed += total; break;
    }
  }

  // Count pending bills
  const pendingBills = await Bill.count({
    where: {
      tenantId,
      createdAt: { [Op.between]: [startOfDay, endOfDay] },
      paymentStatus: 'PENDING',
    },
  });
  summary.pending = pendingBills;

  return summary;
}

module.exports = { createBill, getBills, getBillById, getDaySummary };
