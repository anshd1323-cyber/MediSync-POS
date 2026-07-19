const { sequelize, Clinic, User, CareEpisode, Consultation } = require('../src/models');
const { bookAppointment } = require('../src/controllers/appointment.controller');

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

  // 2. Mock req and res
  const mockReq1 = {
    user: { id: patient.id },
    body: { doctorId: doctor.id, scheduledAt, fee: 20 }
  };
  const mockReq2 = {
    user: { id: patient.id },
    body: { doctorId: doctor.id, scheduledAt, fee: 20 }
  };

  // 3. Trigger parallel booking
  console.log('Testing parallel bookings for row-locking...');
  const runRoute = (req, name) => new Promise((resolve) => {
    const res = {
      status: (code) => ({
        json: (data) => {
          console.log(`[${name}] Status: ${code}`, JSON.stringify(data));
          resolve();
        }
      }),
      json: (data) => {
        console.log(`[${name}] JSON`, JSON.stringify(data));
        resolve();
      }
    };
    const next = (err) => {
      console.log(`[${name}] NEXT error:`, err);
      resolve();
    };
    bookAppointment(req, res, next);
  });

  const results = await Promise.allSettled([
    runRoute(mockReq1, 'Req1'),
    runRoute(mockReq2, 'Req2')
  ]);
  
  console.log('Results:', results);

  // 4. Verify DB state
  const episodes = await CareEpisode.findAll({ include: ['booking'] });
  console.log('\n--- Final CareEpisodes in DB ---');
  episodes.forEach(e => console.log(`Episode ID: ${e.id}, Status: ${e.status}, ClinicID: ${e.clinicId}, BookingID: ${e.bookingId}`));
  
  if (episodes.length === 1) {
    console.log('SUCCESS: Only 1 CareEpisode created despite parallel requests.');
  } else {
    console.log(`FAILED: Expected 1 CareEpisode, found ${episodes.length}`);
  }
}

runTest().then(() => process.exit(0)).catch(console.error);
