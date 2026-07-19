const { sequelize, Clinic, User, Product } = require('./src/models');
const { bookAppointment } = require('./src/controllers/appointment.controller');
const { finalizeConsultation } = require('./src/controllers/consultation.controller');
const { lookupEpisode } = require('./src/controllers/pos.controller');

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
    price: 10.00,
    stockQuantity: 100
  });

  const scheduledAt = '2026-07-20T10:00:00.000Z';

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

  // 1. Create booking
  const mockReqBook = {
    user: { id: patient.id },
    body: { doctorId: doctor.id, scheduledAt, fee: 30 }
  };
  const bookResult = await runRoute(bookAppointment, mockReqBook, 'BookReq');
  const consultationId = bookResult.data.data.appointment.id;

  // 2. Finalize with drugs
  const mockReqFinalize = {
    user: { id: doctor.id, clinicId: clinic.id },
    params: { id: consultationId },
    body: {
      notes: "Routine checkup completed.",
      prescriptionItems: [{
        productId: product.id,
        dosage: '500mg',
        frequency: 'QD',
        durationDays: 30,
        substitutionAllowed: false,
        scheduleClass: 'H',
        quantityPrescribed: 30
      }]
    }
  };
  await runRoute(finalizeConsultation, mockReqFinalize, 'FinalizeReq');

  // 3. Trigger POS Lookup
  console.log('Testing POS Lookup by patientId...');
  const mockReqLookup = {
    user: { id: doctor.id, clinicId: clinic.id }, // mimicking cashier who shares clinicId
    query: { patientId: patient.id }
  };
  
  const lookupResult = await runRoute(lookupEpisode, mockReqLookup, 'LookupReq');

  if (lookupResult.code === 200) {
    const episode = lookupResult.data.data;
    console.log(`Episode ID: ${episode.id}`);
    console.log(`Invoice Included: ${!!episode.invoice}`);
    console.log(`Invoice Total: $${episode.invoice?.totalAmount}`);
    console.log(`Prescription Included: ${!!episode.prescriptionRecord}`);
    console.log(`Prescription Items Count: ${episode.prescriptionRecord?.items?.length}`);
    if (episode.prescriptionRecord?.items?.length > 0) {
      console.log(`First Item Product Name: ${episode.prescriptionRecord.items[0].product.name}`);
    }

    if (episode.invoice && episode.prescriptionRecord && episode.prescriptionRecord.items[0].product) {
      console.log('SUCCESS: Lookup endpoint correctly built the full populated POS graph.');
    } else {
      console.log('FAILED: Missing relationships in lookup result.');
    }
  } else {
    console.log('FAILED: Lookup failed', lookupResult);
  }
}

runTest().then(() => process.exit(0)).catch(console.error);
