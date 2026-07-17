const { sequelize, Invoice, InvoiceItem, Consultation } = require('../models');
const catchAsync = require('../utils/catchAsync');

const generateInvoice = catchAsync(async (req, res) => {
  const { consultationId, patientName, items, discount } = req.body;
  const doctorId = req.user.id;
  const clinicId = req.user.clinicId;

  if (!clinicId) {
    return res.status(403).json({ success: false, message: 'Practitioner is not associated with any clinic.' });
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      let fee = 15.00;
      let finalPatientName = patientName || 'Walk-in Patient';

      // If linked to a consultation, fetch notes and check patient name
      if (consultationId) {
        const consult = await Consultation.findByPk(consultationId, {
          include: [{ association: 'patient' }],
          transaction: t
        });
        if (consult) {
          fee = parseFloat(consult.fee || 15.00);
          if (consult.patient) {
            finalPatientName = consult.patient.name;
          }
        }
      }

      // Add consultation fee item automatically if not in catalog
      const itemsList = items || [];
      if (itemsList.length === 0) {
        itemsList.push({ itemName: 'Consultation Fee', price: fee });
      }

      const subtotal = itemsList.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
      const tax = parseFloat((subtotal * 0.05).toFixed(2)); // 5% healthcare tax
      const disc = parseFloat(discount || 0);
      const total = Math.max(0, parseFloat((subtotal + tax - disc).toFixed(2)));

      const invoice = await Invoice.create({
        consultationId: consultationId || null,
        clinicId,
        totalAmount: total,
        paymentStatus: 'UNPAID',
        paymentMethod: 'CASH',
        taxApplied: tax
      }, { transaction: t });

      // Create item lines
      const itemRecords = itemsList.map(item => ({
        invoiceId: invoice.id,
        itemName: item.itemName,
        price: parseFloat(item.price || 0)
      }));

      await InvoiceItem.bulkCreate(itemRecords, { transaction: t });

      // Fetch invoice with items
      const completeInvoice = await Invoice.findByPk(invoice.id, {
        include: [{ model: InvoiceItem, as: 'items' }],
        transaction: t
      });

      return completeInvoice;
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const payInvoice = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { paymentMethod } = req.body;

  if (!['CASH', 'CARD', 'UPI'].includes(paymentMethod)) {
    return res.status(400).json({ success: false, message: 'Invalid payment method. Use CASH, CARD, or UPI.' });
  }

  const invoice = await Invoice.findByPk(id);
  if (!invoice) {
    return res.status(404).json({ success: false, message: 'Invoice not found.' });
  }

  invoice.paymentMethod = paymentMethod;
  invoice.paymentStatus = 'PAID';
  await invoice.save();

  // If associated with a consultation, update consultation payment status
  if (invoice.consultationId) {
    const consult = await Consultation.findByPk(invoice.consultationId);
    if (consult) {
      consult.paymentStatus = 'PAID';
      await consult.save();
    }
  }

  res.status(200).json({ success: true, data: invoice });
});

const getClinicInvoices = catchAsync(async (req, res) => {
  const clinicId = req.user.clinicId;
  const invoices = await Invoice.findAll({
    where: { clinicId },
    include: [{ model: InvoiceItem, as: 'items' }],
    order: [['createdAt', 'DESC']]
  });
  res.status(200).json({ success: true, data: invoices });
});

const renewSubscription = catchAsync(async (req, res) => {
  const clinicId = req.user.clinicId;
  const { Clinic } = require('../models');

  if (!clinicId) {
    return res.status(400).json({ success: false, message: 'User is not associated with any clinic.' });
  }

  const clinic = await Clinic.findByPk(clinicId);
  if (!clinic) {
    return res.status(404).json({ success: false, message: 'Clinic not found.' });
  }

  const newExpiry = new Date();
  newExpiry.setDate(newExpiry.getDate() + 30); // Extend 30 days

  clinic.subscriptionStatus = 'ACTIVE';
  clinic.subscriptionExpiresAt = newExpiry;
  await clinic.save();

  res.status(200).json({ success: true, message: 'Subscription successfully extended by 30 days.', data: clinic });
});

module.exports = { generateInvoice, payInvoice, getClinicInvoices, renewSubscription };
