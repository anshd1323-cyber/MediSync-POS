const { sequelize, Clinic, User, CareEpisode, Consultation, Invoice, InvoiceItem } = require('../src/models');
const { bookAppointment } = require('../src/controllers/appointment.controller');
const { finalizeConsultation } = require('../src/controllers/consultation.controller');

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

  const scheduledAt = '2026-07-20T10:00:00.000Z';

  const runRoute = (routeFn, req, name) => new Promise((resolve) => {
    const res = {
      status: (code) => ({
        json: (data) => {
          resolve(data);
        }
      }),
      json: (data) => resolve(data)
    };
    const next = (err) => resolve(err);
    routeFn(req, res, next);
  });

  // 1. Create booking (fee: $30)
  const mockReqBook = {
    user: { id: patient.id },
    body: { doctorId: doctor.id, scheduledAt, fee: 30 }
  };
  const bookResult = await runRoute(bookAppointment, mockReqBook, 'BookReq');
  const consultationId = bookResult.data.appointment.id;

  // 2. Trigger finalize
  console.log('Testing auto-invoice generation on consult finalize...');
  const mockReqFinalize = {
    user: { id: doctor.id, clinicId: clinic.id },
    params: { id: consultationId },
    body: {
      notes: "Routine checkup completed.",
      prescriptionItems: []
    }
  };
  
  await runRoute(finalizeConsultation, mockReqFinalize, 'FinalizeReq');

  // 3. Verify DB state
  const episode = await CareEpisode.findOne({ where: { bookingId: consultationId } });
  console.log(`CareEpisode Final InvoiceID: ${episode.invoiceId}`);

  const invoice = await Invoice.findByPk(episode.invoiceId, { include: ['items'] });
  if (invoice) {
    console.log(`Invoice Total: $${invoice.totalAmount}, Tax: $${invoice.taxApplied}, Status: ${invoice.paymentStatus}`);
    invoice.items.forEach(item => {
      console.log(` - Item: ${item.itemName} | Price: $${item.price}`);
    });

    if (invoice.totalAmount === 31.50) { // $30 + 5% tax = $31.50
      console.log('SUCCESS: Auto-invoice generated properly with consultation fee and tax math.');
    } else {
      console.log(`FAILED: Unexpected invoice total: ${invoice.totalAmount}`);
    }
  } else {
    console.log('FAILED: No invoice found.');
  }
}

runTest().then(() => process.exit(0)).catch(console.error);
