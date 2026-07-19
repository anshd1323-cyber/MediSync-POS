const { sequelize, Invoice, InvoiceItem, Consultation, Product, CareEpisode, Prescription, PrescriptionItem, AuditLog } = require('../models');
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

      const itemsList = items || [];
      const itemRecords = [];
      let subtotal = 0;

      for (const item of itemsList) {
        if (item.productId && item.quantity) {
          const product = await Product.findOne({
            where: { id: item.productId, clinicId },
            lock: t.LOCK.UPDATE,
            transaction: t
          });

          if (!product) {
            throw new Error(`Product not found.`);
          }

          if (product.stockQuantity < item.quantity) {
            throw new Error(`Insufficient stock for product: ${product.name}`);
          }

          product.stockQuantity -= item.quantity;
          await product.save({ transaction: t });

          const price = parseFloat(product.price);
          const totalItemPrice = price * item.quantity;
          subtotal += totalItemPrice;

          itemRecords.push({
            itemName: `${product.name} (x${item.quantity})`,
            price: totalItemPrice
          });
        } else if (item.itemName) {
          const price = parseFloat(item.price || 0);
          subtotal += price;
          itemRecords.push({
            itemName: item.itemName,
            price: price
          });
        }
      }

      // Add consultation fee item automatically if consultationId is supplied or no items provided
      if (consultationId) {
        itemRecords.push({ itemName: 'Consultation Fee', price: fee });
        subtotal += fee;
      } else if (itemRecords.length === 0) {
        itemRecords.push({ itemName: 'Consultation Fee', price: fee });
        subtotal += fee;
      }

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
      const finalItemRecords = itemRecords.map(record => ({
        ...record,
        invoiceId: invoice.id
      }));

      await InvoiceItem.bulkCreate(finalItemRecords, { transaction: t });

      // Fetch invoice with items
      const completeInvoice = await Invoice.findByPk(invoice.id, {
        include: [{ model: InvoiceItem, as: 'items' }],
        transaction: t
      });

      return completeInvoice;
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err.message.includes('Insufficient stock') || err.message.includes('Product not found')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

const payInvoice = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { paymentMethod, items } = req.body;
  const clinicId = req.user.clinicId;

  if (!['CASH', 'CARD', 'UPI', 'MIXED'].includes(paymentMethod)) {
    return res.status(400).json({ success: false, message: 'Invalid payment method. Use CASH, CARD, UPI, or MIXED.' });
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      const invoice = await Invoice.findByPk(id, { lock: t.LOCK.UPDATE, transaction: t });
      if (!invoice) throw new Error('INVOICE_NOT_FOUND');
      if (invoice.paymentStatus === 'PAID') throw new Error('ALREADY_PAID');
      if (invoice.clinicId !== clinicId) throw new Error('UNAUTHORIZED');

      let subtotalIncrease = 0;
      const newInvoiceItems = [];

      // Process dispensed drugs (items from the POS cart)
      if (items && items.length > 0) {
        for (const item of items) {
          if (!item.productId || !item.quantity) continue;
          
          // Lock product to safely deduct stock
          const product = await Product.findOne({
            where: { id: item.productId, clinicId },
            lock: t.LOCK.UPDATE,
            transaction: t
          });
          if (!product) throw new Error(`Product not found: ${item.productId}`);
          if (product.stockQuantity < item.quantity) throw new Error(`Insufficient stock for product: ${product.name}`);

          // Controlled Substance Gate: Evaluate product.scheduleClass before deducting stock
          if (['H1', 'X'].includes(product.scheduleClass)) {
            if (req.user.role !== 'PHARMACIST' && req.user.role !== 'DOCTOR') {
              throw new Error(`CONTROLLED_SUBSTANCE_RESTRICTION: Only pharmacists or doctors can dispense Schedule ${product.scheduleClass} drugs.`);
            }

            await AuditLog.create({
              clinicId,
              userId: req.user.id,
              action: 'DISPENSED_CONTROLLED',
              entityId: product.id,
              details: {
                productId: product.id,
                productName: product.name,
                scheduleClass: product.scheduleClass,
                quantityDispensed: item.quantity,
                ...(item.prescriptionItemId ? { prescriptionItemId: item.prescriptionItemId } : {})
              }
            }, { transaction: t });
          }

          // Deduct stock
          product.stockQuantity -= item.quantity;
          await product.save({ transaction: t });

          // Calculate cost
          const price = parseFloat(product.price);
          const totalItemPrice = price * item.quantity;
          subtotalIncrease += totalItemPrice;

          newInvoiceItems.push({
            invoiceId: invoice.id,
            itemName: `${product.name} (x${item.quantity})`,
            price: totalItemPrice
          });

          // Traceability: Bump PrescriptionItem.quantityDispensed if linked
          if (item.prescriptionItemId) {
            const pItem = await PrescriptionItem.findByPk(item.prescriptionItemId, { lock: t.LOCK.UPDATE, transaction: t });
            if (pItem) {
              pItem.quantityDispensed += item.quantity;
              await pItem.save({ transaction: t });
            }
          }
        }

        if (newInvoiceItems.length > 0) {
          await InvoiceItem.bulkCreate(newInvoiceItems, { transaction: t });
          
          // Update invoice totals
          const newTax = parseFloat((subtotalIncrease * 0.05).toFixed(2));
          invoice.taxApplied = parseFloat(invoice.taxApplied) + newTax;
          invoice.totalAmount = parseFloat(invoice.totalAmount) + subtotalIncrease + newTax;
        }
      }

      invoice.paymentMethod = paymentMethod;
      invoice.paymentStatus = 'PAID';
      await invoice.save({ transaction: t });

      // If associated with a consultation/care episode, update status
      if (invoice.consultationId) {
        const consult = await Consultation.findByPk(invoice.consultationId, { transaction: t });
        if (consult) {
          consult.paymentStatus = 'PAID';
          await consult.save({ transaction: t });
        }
      }

      return invoice;
    });

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    if (['INVOICE_NOT_FOUND', 'ALREADY_PAID', 'UNAUTHORIZED'].includes(err.message) || err.message.startsWith('Insufficient') || err.message.startsWith('Product') || err.message.startsWith('CONTROLLED_SUBSTANCE_RESTRICTION')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

const getClinicInvoices = catchAsync(async (req, res) => {
  const clinicId = req.user.clinicId;
  const invoices = await Invoice.findAll({
    where: { clinicId },
    include: [
      { model: InvoiceItem, as: 'items' },
      { 
        model: Consultation, 
        as: 'consultation',
        include: [{ association: 'patient', attributes: ['name', 'email'] }]
      }
    ],
    order: [['createdAt', 'DESC']]
  });
  
  const data = invoices.map(inv => {
    const json = inv.toJSON();
    json.patientName = json.consultation?.patient?.name || 'Walk-in Patient';
    return json;
  });

  res.status(200).json({ success: true, data });
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

const lookupEpisode = catchAsync(async (req, res) => {
  const clinicId = req.user.clinicId;
  const { patientId, consultationId } = req.query;

  if (!patientId && !consultationId) {
    return res.status(400).json({ success: false, message: 'Either patientId or consultationId must be provided for lookup.' });
  }

  const where = { clinicId };
  if (patientId) where.patientId = patientId;
  if (consultationId) where.bookingId = consultationId;

  const episode = await CareEpisode.findOne({
    where,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: Invoice,
        as: 'invoice',
        include: [{ model: InvoiceItem, as: 'items' }]
      },
      {
        model: Prescription,
        as: 'prescriptionRecord',
        include: [{ 
          model: PrescriptionItem, 
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }]
      },
      {
        model: Consultation,
        as: 'booking',
        include: [{ association: 'patient' }, { association: 'doctor' }]
      }
    ]
  });

  if (!episode) {
    return res.status(404).json({ success: false, message: 'No care episode found matching criteria.' });
  }

  res.status(200).json({ success: true, data: episode });
});

module.exports = { generateInvoice, payInvoice, getClinicInvoices, renewSubscription, lookupEpisode };
