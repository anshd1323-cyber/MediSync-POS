const { sequelize, Clinic, User, CareEpisode, Consultation, Prescription, Product, PrescriptionItem } = require('../src/models');
const { bookAppointment } = require('../src/controllers/appointment.controller');
const { finalizeConsultation } = require('../src/controllers/consultation.controller');

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
    name: 'Metformin 500mg',
    price: 10.00,
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

  // 3. Create appointment
  const mockReqBook = {
    user: { id: patient.id },
    body: { doctorId: doctor.id, scheduledAt, fee: 20 }
  };
  const bookResult = await runRoute(bookAppointment, mockReqBook, 'BookReq');
  const consultationId = bookResult.data.appointment.id;

  // 4. Trigger parallel finalization
  console.log('Testing parallel finalization with structured drug entries for row-locking...');
  const mockReqFinalize1 = {
    user: { id: doctor.id, clinicId: clinic.id },
    params: { id: consultationId },
    body: {
      notes: "Patient presents with mild fever.",
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
  
  const mockReqFinalize2 = {
    user: { id: doctor.id, clinicId: clinic.id },
    params: { id: consultationId },
    body: {
      notes: "Patient presents with mild fever. Doing great.",
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

  const results = await Promise.allSettled([
    runRoute(finalizeConsultation, mockReqFinalize1, 'FinalizeReq1'),
    runRoute(finalizeConsultation, mockReqFinalize2, 'FinalizeReq2')
  ]);

  // 5. Verify DB state
  const consult = await Consultation.findByPk(consultationId);
  console.log(`Consultation Status: ${consult.status}`);

  const episode = await CareEpisode.findOne({ where: { bookingId: consultationId } });
  console.log(`CareEpisode Status: ${episode.status}, Linked Prescription: ${episode.prescriptionId}`);

  const prescriptions = await Prescription.findAll();
  prescriptions.forEach(p => console.log(`Prescription ID: ${p.id}, Status: ${p.status}`));

  const items = await PrescriptionItem.findAll();
  console.log(`Total Prescription Items: ${items.length}`);

  if (prescriptions.length === 1 && prescriptions[0].status === 'SIGNED' && items.length === 1) {
    console.log('SUCCESS: Finalization properly locked, creating 1 signed prescription with 1 item.');
  } else {
    console.log('FAILED: Unexpected DB state.');
  }
}

runTest().then(() => process.exit(0)).catch(console.error);
