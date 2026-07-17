const sequelize = require('./src/config/database');
const { User, DoctorProfile, DoctorAvailability, Clinic } = require('./src/models');
const bcrypt = require('bcrypt');

async function seed() {
  await sequelize.sync({ force: true });

  // Seed default clinic
  const clinic = await Clinic.create({
    name: 'MediSync Central Clinic',
    address: '742 Evergreen Terrace, Springfield',
    latitude: 12.9716, // Bangalore/Springfield location coordinates
    longitude: 77.5946,
    subscriptionStatus: 'ACTIVE',
    subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  });

  const doctors = [
    { name: 'Dr. Gregory House', email: 'house@medisync.com', spec: 'Diagnostic Medicine', exp: 20 },
    { name: 'Dr. Meredith Grey', email: 'grey@medisync.com', spec: 'General Surgery', exp: 12 },
    { name: 'Dr. Stephen Strange', email: 'strange@medisync.com', spec: 'Neurosurgery', exp: 15 },
    { name: 'Dr. John Dorian', email: 'jd@medisync.com', spec: 'Internal Medicine', exp: 8 },
  ];

  for (const doc of doctors) {
    let user = await User.findOne({ where: { email: doc.email } });
    if (!user) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = await User.create({
        name: doc.name,
        email: doc.email,
        password: hashedPassword,
        role: 'DOCTOR',
        clinicId: clinic.id
      });
      await DoctorProfile.create({
        userId: user.id,
        specialization: doc.spec,
        yearsOfExperience: doc.exp
      });
    }

    // Seed availabilities for each doctor (Mon, Wed, Fri 09:00 - 17:00)
    const days = [1, 3, 5]; // Mon, Wed, Fri
    for (const day of days) {
      const exists = await DoctorAvailability.findOne({ where: { doctorId: user.id, dayOfWeek: day } });
      if (!exists) {
        await DoctorAvailability.create({
          doctorId: user.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          slotDuration: 30,
          bufferTime: 10
        });
      }
    }
  }
  console.log('Seeded 4 doctors, default Clinic & availability schedules successfully!');
  process.exit(0);
}

seed().catch(console.error);
