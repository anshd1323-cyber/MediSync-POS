const { sequelize, Clinic, User, Product } = require('../src/models');
const { bookAppointment } = require('../src/controllers/appointment.controller');
const { finalizeConsultation } = require('../src/controllers/consultation.controller');
const { lookupEpisode } = require('../src/controllers/pos.controller');

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
    email: 'doc@test.com',
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
    name: 'Paracetamol 500mg',
    price: 5.00,
    stockQuantity: 100
  });

  const runRoute = (routeFn, req) => new Promise((resolve) => {
    const res = {
      status: (code) => ({
        json: (data) => resolve({ code, data })
      }),
      json: (data) => resolve({ code: 200, data })
    };
    routeFn(req, res, () => {});
  });

  // 1. Create booking (fee $30)
  const reqBook = {
    user: { id: patient.id },
    body: { doctorId: doctor.id, scheduledAt: '2026-07-20T10:00:00.000Z', fee: 30 }
  };
  const resBook = await runRoute(bookAppointment, reqBook);
  const consultationId = resBook.data.data.appointment.id;

  // 2. Finalize with drugs
  const reqFinalize = {
    user: { id: doctor.id, clinicId: clinic.id },
    params: { id: consultationId },
    body: {
      notes: "Fever.",
      prescriptionItems: [{
        productId: product.id,
        dosage: '500mg',
        frequency: 'QD',
        durationDays: 5,
        quantityPrescribed: 5
      }]
    }
  };
  await runRoute(finalizeConsultation, reqFinalize);

  // 3. Lookup Episode via consultationId
  console.log('--- TEST: lookupEpisode via consultationId ---');
  const reqLookupConsult = {
    user: { clinicId: clinic.id },
    query: { consultationId }
  };
  const resLookupConsult = await runRoute(lookupEpisode, reqLookupConsult);
  
  if (resLookupConsult.code === 200) {
    const ep = resLookupConsult.data.data;
    console.log(`CareEpisode found? ${!!ep}`);
    console.log(`Invoice included? ${!!ep.invoice} | Item count: ${ep.invoice?.items?.length}`);
    console.log(`Prescription included? ${!!ep.prescriptionRecord} | Item count: ${ep.prescriptionRecord?.items?.length}`);
    if (ep.prescriptionRecord?.items?.length > 0) {
      console.log(`-> Drug populated: ${ep.prescriptionRecord.items[0].product?.name}`);
    }
    console.log(`Booking included? ${!!ep.booking}`);
    console.log(`-> Patient populated: ${ep.booking?.patient?.name}`);
    console.log(`-> Doctor populated: ${ep.booking?.doctor?.name}`);

    console.log('\n--- FULL JSON RESPONSE ---');
    console.log(JSON.stringify(ep, null, 2));
  } else {
    console.log('Lookup failed', resLookupConsult);
  }
}

runTest().then(() => process.exit(0)).catch(console.error);
