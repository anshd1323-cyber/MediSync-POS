const { sequelize, Clinic, User, Product, Invoice, AuditLog } = require('../src/models');
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
    email: 'doc@test.com',
    password: 'pass',
    role: 'DOCTOR',
    clinicId: clinic.id
  });

  const staff = await User.create({
    name: 'Staff',
    email: 'staff@test.com',
    password: 'pass',
    role: 'STAFF',
    clinicId: clinic.id
  });

  const product = await Product.create({
    clinicId: clinic.id,
    name: 'Walk-in Oxycodone 5mg',
    price: 50.00,
    stockQuantity: 100,
    scheduleClass: 'X' // New field!
  });

  const invoice = await Invoice.create({
    clinicId: clinic.id,
    totalAmount: 0,
    paymentStatus: 'UNPAID',
    paymentMethod: 'CASH',
    taxApplied: 0
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

  console.log('--- TEST 1: Walk-in controlled substance via Staff (should fail) ---');
  const req1 = {
    user: { id: staff.id, role: staff.role, clinicId: clinic.id },
    params: { id: invoice.id },
    body: {
      paymentMethod: 'CASH',
      items: [{ productId: product.id, quantity: 10 }] // No prescriptionItemId
    }
  };
  const res1 = await runRoute(payInvoice, req1);
  console.log(`Staff Dispense Result: ${res1.code} - ${res1.data.message}`);

  console.log('--- TEST 2: Walk-in controlled substance via Doctor (should succeed and log) ---');
  const req2 = {
    user: { id: doctor.id, role: doctor.role, clinicId: clinic.id },
    params: { id: invoice.id },
    body: {
      paymentMethod: 'CASH',
      items: [{ productId: product.id, quantity: 10 }] // No prescriptionItemId
    }
  };
  const res2 = await runRoute(payInvoice, req2);
  console.log(`Doctor Dispense Result: ${res2.code}`);
  
  const logs = await AuditLog.findAll();
  console.log(`AuditLogs created: ${logs.length}`);
  if (logs.length > 0) {
    console.log(`Action: ${logs[0].action}, User: ${logs[0].userId}, Details: ${JSON.stringify(logs[0].details)}`);
  }
}

runTest().then(() => process.exit(0)).catch(console.error);
