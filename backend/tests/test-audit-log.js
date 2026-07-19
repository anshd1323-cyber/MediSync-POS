const { sequelize, Clinic, User, Product, CareEpisode, Invoice, PrescriptionItem, AuditLog } = require('../src/models');
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

  const pharmacist = await User.create({
    name: 'Pharmacist',
    email: 'rx@test.com',
    password: 'pass',
    role: 'PHARMACIST',
    clinicId: clinic.id
  });

  const product = await Product.create({
    clinicId: clinic.id,
    name: 'Oxycodone 5mg',
    price: 50.00,
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

  // 2. Finalize with controlled Schedule X drug
  const mockReqFinalize = {
    user: { id: doctor.id, clinicId: clinic.id },
    params: { id: consultationId },
    body: {
      notes: "Severe pain.",
      prescriptionItems: [{
        productId: product.id,
        dosage: '5mg',
        frequency: 'QD',
        durationDays: 10,
        scheduleClass: 'X',
        quantityPrescribed: 10
      }]
    }
  };
  await runRoute(finalizeConsultation, mockReqFinalize, 'FinalizeReq');

  const episode = await CareEpisode.findOne({ where: { bookingId: consultationId } });
  const pItem = await PrescriptionItem.findOne({ where: { prescriptionId: episode.prescriptionId } });

  // 3. Dispense with PHARMACIST (should trigger AuditLog)
  console.log('Dispensing controlled substance to test AuditLog...');
  const mockReqPayRx = {
    user: { id: pharmacist.id, role: pharmacist.role, clinicId: clinic.id },
    params: { id: episode.invoiceId },
    body: {
      paymentMethod: 'CASH',
      items: [{
        productId: product.id,
        prescriptionItemId: pItem.id,
        quantity: 10
      }]
    }
  };

  await runRoute(payInvoice, mockReqPayRx, 'PayReqRx');

  // 4. Verify AuditLog
  const logs = await AuditLog.findAll();
  console.log(`Found ${logs.length} AuditLog entries.`);
  
  if (logs.length === 1) {
    const log = logs[0];
    console.log(`Action: ${log.action}`);
    console.log(`User ID: ${log.userId} (Pharmacist ID is ${pharmacist.id})`);
    console.log(`Details: ${JSON.stringify(log.details)}`);
    if (log.action === 'DISPENSED_CONTROLLED' && log.userId === pharmacist.id) {
      console.log('SUCCESS: AuditLog accurately captured the controlled substance dispensing event.');
    } else {
      console.log('FAILED: AuditLog contents mismatch.');
    }
  } else {
    console.log('FAILED: Expected 1 AuditLog, found ' + logs.length);
  }
}

runTest().then(() => process.exit(0)).catch(console.error);
