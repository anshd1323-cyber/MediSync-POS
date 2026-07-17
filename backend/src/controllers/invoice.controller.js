const invoiceService = require('../services/invoice.service');
const catchAsync = require('../utils/catchAsync');

const createInvoice = catchAsync(async (req, res) => {
  // If doctor, use req.user.id. If patient, throw forbidden.
  if (req.user.role !== 'DOCTOR') {
    return res.status(403).json({ success: false, message: 'Only doctor or clinic staff can issue invoices.' });
  }
  const invoice = await invoiceService.createInvoice(req.user.id, req.body);
  res.status(201).json({ success: true, data: invoice });
});

const listMyInvoices = catchAsync(async (req, res) => {
  let invoices;
  if (req.user.role === 'DOCTOR') {
    invoices = await invoiceService.listInvoicesForDoctor(req.user.id);
  } else {
    invoices = await invoiceService.listInvoicesForPatient(req.user.id);
  }
  res.status(200).json({ success: true, data: invoices });
});

module.exports = {
  createInvoice,
  listMyInvoices
};
