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

  const staff = await User.create({
    name: 'Normal Staff',
    email: 'staff@test.com',
    password: 'pass',
    role: 'STAFF', // neither pharmacist nor doctor
    clinicId: clinic.id
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

  // 3. Try dispensing with normal STAFF (should fail)
  console.log('Testing Controlled Substance Gate for Normal Staff (should fail)...');
  const mockReqPayStaff = {
    user: { id: staff.id, role: staff.role, clinicId: clinic.id },
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
  
  const staffResult = await runRoute(payInvoice, mockReqPayStaff, 'PayReqStaff');
  console.log(`Staff Dispense Result: ${staffResult.code} - ${staffResult.data.message}`);

  // 4. Try dispensing with PHARMACIST (should succeed)
  console.log('Testing Controlled Substance Gate for Pharmacist (should succeed)...');
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

  const rxResult = await runRoute(payInvoice, mockReqPayRx, 'PayReqRx');
  console.log(`Pharmacist Dispense Result: ${rxResult.code} - ${rxResult.data.success}`);

  if (staffResult.code === 400 && staffResult.data.message.includes('CONTROLLED_SUBSTANCE_RESTRICTION') && rxResult.code === 200) {
    console.log('SUCCESS: Controlled Substance Gate blocks unauthorized staff perfectly!');
  } else {
    console.log('FAILED: Authorization logic mismatch.');
  }
}

runTest().then(() => process.exit(0)).catch(console.error);
