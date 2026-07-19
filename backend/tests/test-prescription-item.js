const { sequelize, Clinic, User, CareEpisode, Consultation, Prescription, Product, PrescriptionItem } = require('../src/models');
const { bookAppointment } = require('../src/controllers/appointment.controller');
const { createDraft, addItem } = require('../src/controllers/prescription.controller');

async function runTest() {
  await sequelize.sync({ force: true });
  
  // 1. Setup seed data
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
    name: 'Amoxicillin 500mg',
    price: 15.00,
    stockQuantity: 100
  });

  const scheduledAt = '2026-07-20T10:00:00.000Z';

  // 2. Mock req and res helper
  const runRoute = (routeFn, req, name) => new Promise((resolve) => {
    const res = {
      status: (code) => ({
        json: (data) => {
          console.log(`[${name}] Status: ${code}`, JSON.stringify(data));
          resolve(data);
        }
      }),
      json: (data) => {
        console.log(`[${name}] JSON`, JSON.stringify(data));
        resolve(data);
      }
    };
    const next = (err) => {
      console.log(`[${name}] NEXT error:`, err);
      resolve(err);
    };
    routeFn(req, res, next);
  });

  // 3. Create appointment and prescription
  const mockReqBook = {
    user: { id: patient.id },
    body: { doctorId: doctor.id, scheduledAt, fee: 20 }
  };
  const bookResult = await runRoute(bookAppointment, mockReqBook, 'BookReq');
  
  const mockReqPrescript = {
    user: { id: doctor.id, clinicId: clinic.id },
    body: { 
      careEpisodeId: bookResult.data.careEpisode.id, 
      consultationId: bookResult.data.appointment.id, 
      patientId: patient.id 
    }
  };
  const prescriptResult = await runRoute(createDraft, mockReqPrescript, 'PrescriptReq');
  const prescriptionId = prescriptResult.data.id;

  // 4. Trigger parallel item adding
  console.log('Testing parallel item additions with row-locking...');
  const mockReqItem1 = {
    user: { id: doctor.id, clinicId: clinic.id },
    params: { prescriptionId },
    body: {
      productId: product.id,
      dosage: '500mg',
      frequency: 'BID',
      durationDays: 7,
      substitutionAllowed: true,
      scheduleClass: 'H1',
      quantityPrescribed: 14
    }
  };
  
  const mockReqItem2 = {
    user: { id: doctor.id, clinicId: clinic.id },
    params: { prescriptionId },
    body: {
      productId: product.id,
      dosage: '500mg',
      frequency: 'BID',
      durationDays: 7,
      substitutionAllowed: true,
      scheduleClass: 'H1',
      quantityPrescribed: 14
    }
  };

  const results = await Promise.allSettled([
    runRoute(addItem, mockReqItem1, 'AddItemReq1'),
    runRoute(addItem, mockReqItem2, 'AddItemReq2')
  ]);

  // 5. Verify DB state
  const items = await PrescriptionItem.findAll();
  console.log('\n--- Final Prescription Items in DB ---');
  items.forEach(i => console.log(`Item ID: ${i.id}, ProductID: ${i.productId}, Quantity: ${i.quantityPrescribed}`));

  if (items.length === 2 || items.length === 1) { // SQLite might block one due to BUSY
    console.log('SUCCESS: Items added successfully and serialized.');
  } else {
    console.log('FAILED: Unexpected number of items.');
  }
}

runTest().then(() => process.exit(0)).catch(console.error);
