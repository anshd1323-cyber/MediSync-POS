const { sequelize, Clinic, User, CareEpisode, Consultation, Prescription } = require('../src/models');
const { bookAppointment } = require('../src/controllers/appointment.controller');
const { createDraft } = require('../src/controllers/prescription.controller');

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

  // 3. Create initial appointment and care episode
  const mockReqBook = {
    user: { id: patient.id },
    body: { doctorId: doctor.id, scheduledAt, fee: 20 }
  };
  
  const bookResult = await runRoute(bookAppointment, mockReqBook, 'BookReq');
  const careEpisodeId = bookResult.data.careEpisode.id;
  const consultationId = bookResult.data.appointment.id;

  // 4. Trigger parallel prescription creation
  console.log('Testing parallel prescriptions for row-locking...');
  const mockReqPrescript1 = {
    user: { id: doctor.id, clinicId: clinic.id },
    body: { careEpisodeId, consultationId, patientId: patient.id }
  };
  const mockReqPrescript2 = {
    user: { id: doctor.id, clinicId: clinic.id },
    body: { careEpisodeId, consultationId, patientId: patient.id }
  };

  const results = await Promise.allSettled([
    runRoute(createDraft, mockReqPrescript1, 'PrescriptReq1'),
    runRoute(createDraft, mockReqPrescript2, 'PrescriptReq2')
  ]);

  // 5. Verify DB state
  const prescriptions = await Prescription.findAll();
  console.log('\n--- Final Prescriptions in DB ---');
  prescriptions.forEach(p => console.log(`Prescription ID: ${p.id}, Status: ${p.status}, CareEpisodeID: ${p.careEpisodeId}`));
  
  const finalEpisode = await CareEpisode.findByPk(careEpisodeId);
  console.log(`CareEpisode Final Status: ${finalEpisode.status}, Linked Prescription: ${finalEpisode.prescriptionId}`);

  if (prescriptions.length === 1 && finalEpisode.prescriptionId === prescriptions[0].id) {
    console.log('SUCCESS: Only 1 Prescription created despite parallel requests.');
  } else {
    console.log(`FAILED: Expected 1 Prescription, found ${prescriptions.length}`);
  }
}

runTest().then(() => process.exit(0)).catch(console.error);
