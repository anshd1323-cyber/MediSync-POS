const { sequelize, Clinic, User, Product, CareEpisode, Invoice, PrescriptionItem } = require('../src/models');
const { bookAppointment } = require('../src/controllers/appointment.controller');
const { finalizeConsultation } = require('../src/controllers/consultation.controller');
const { payInvoice } = require('../src/controllers/pos.controller');

async function runTest() {
  await sequelize.sync({ force: true });
  
  const clinic = await Clinic.create({
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Clinic',
    address: '123 Test St',
    latitude: 10,
    longitude: 20,
    subscriptionStatus: 'ACTIVE',
    subscriptionExpiresAt: new Date(Date.now() + 1000000000)
  });
  
  const doctor = await User.create({
    name: 'Dr. Test',
    email: 'doctor@test.com',
    password: 'pass',
    role: 'DOCTOR',
    clinicId: clinic.id
  });
  
  const patient = await User.create({
    name: 'Test Patient',
    email: 'patient@test.com',
    password: 'pass',
    role: 'PATIENT'
  });

  const product = await Product.create({
    clinicId: clinic.id,
    name: 'Metformin 500mg',
    price: 10.00, // $10 per unit
    stockQuantity: 100
  });

  const runRoute = (routeFn, req, name) => new Promise((resolve) => {
    const res = {
      status: (code) => ({
        json: (data) => resolve({ code, data })
      }),
      json: (data) => resolve({ code: 200, data })
    };
    const next = (err) => resolve({ error: err });
    routeFn(req, res, next);
  });

  // 1. Create booking (fee $30)
  const mockReqBook = {
    user: { id: patient.id },
    body: { doctorId: doctor.id, scheduledAt: '2026-07-20T10:00:00.000Z', fee: 30 }
  };
  const bookResult = await runRoute(bookAppointment, mockReqBook, 'BookReq');
  const consultationId = bookResult.data.data.appointment.id;

  // 2. Finalize with drugs (Prescribing 30 units)
  const mockReqFinalize = {
    user: { id: doctor.id, clinicId: clinic.id },
    params: { id: consultationId },
    body: {
      notes: "Routine checkup.",
      prescriptionItems: [{
        productId: product.id,
        dosage: '500mg',
        frequency: 'QD',
        durationDays: 30,
        quantityPrescribed: 30
      }]
    }
  };
  await runRoute(finalizeConsultation, mockReqFinalize, 'FinalizeReq');

  // Fetch state before dispensing
  const episode = await CareEpisode.findOne({ where: { bookingId: consultationId } });
  const pItem = await PrescriptionItem.findOne({ where: { prescriptionId: episode.prescriptionId } });

  // 3. Trigger concurrent dispensing + pay
  console.log('Testing concurrent dispensing and paying with traceability...');
  const mockReqPay1 = {
    user: { id: doctor.id, clinicId: clinic.id },
    params: { id: episode.invoiceId },
    body: {
      paymentMethod: 'MIXED',
      items: [{
        productId: product.id,
        prescriptionItemId: pItem.id,
        quantity: 30
      }]
    }
  };
  
  const mockReqPay2 = {
    user: { id: doctor.id, clinicId: clinic.id },
    params: { id: episode.invoiceId },
    body: {
      paymentMethod: 'MIXED',
      items: [{
        productId: product.id,
        prescriptionItemId: pItem.id,
        quantity: 30
      }]
    }
  };

  await Promise.allSettled([
    runRoute(payInvoice, mockReqPay1, 'PayReq1'),
    runRoute(payInvoice, mockReqPay2, 'PayReq2')
  ]);

  // 4. Verify DB state
  const updatedProduct = await Product.findByPk(product.id);
  const updatedPItem = await PrescriptionItem.findByPk(pItem.id);
  const updatedInvoice = await Invoice.findByPk(episode.invoiceId);

  console.log(`Product Stock: ${updatedProduct.stockQuantity} (Expected 70)`);
  console.log(`PrescriptionItem Dispensed: ${updatedPItem.quantityDispensed} (Expected 30)`);
  // Math: fee $30, drugs $300 (10*30), total subtotal = 330. Tax 5% = 16.5. Total = 346.50.
  console.log(`Invoice Total: $${updatedInvoice.totalAmount} (Expected 346.50)`);

  if (updatedProduct.stockQuantity === 70 && updatedPItem.quantityDispensed === 30 && updatedInvoice.totalAmount == 346.50) {
    console.log('SUCCESS: Dispensing correctly deducted stock, bumped quantityDispensed, and safely handled concurrency.');
  } else {
    console.log('FAILED: DB state mismatch.');
  }
}

runTest().then(() => process.exit(0)).catch(console.error);
