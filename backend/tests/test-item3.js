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

  const productControlled = await Product.create({
    clinicId: clinic.id,
    name: 'Oxycodone 5mg',
    price: 50.00,
    stockQuantity: 100,
    scheduleClass: 'X'
  });

  const productNormal = await Product.create({
    clinicId: clinic.id,
    name: 'Paracetamol 500mg',
    price: 5.00,
    stockQuantity: 5 // Low stock
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

  console.log('--- TEST 1: Forced Rollback (Insufficient Stock on 2nd Item) ---');
  const reqRollback = {
    user: { id: doctor.id, role: doctor.role, clinicId: clinic.id },
    params: { id: invoice.id },
    body: {
      paymentMethod: 'CASH',
      items: [
        { productId: productControlled.id, quantity: 10 }, // This writes AuditLog
        { productId: productNormal.id, quantity: 10 } // This throws Insufficient Stock (only 5 in stock)
      ]
    }
  };
  const resRollback = await runRoute(payInvoice, reqRollback);
  console.log(`Dispense Result: ${resRollback.code} - ${resRollback.data.message}`);

  const logsRollback = await AuditLog.findAll();
  console.log(`AuditLogs created after rollback: ${logsRollback.length}`);
  
  console.log('\n--- TEST 2: Successful Transaction ---');
  const reqSuccess = {
    user: { id: doctor.id, role: doctor.role, clinicId: clinic.id },
    params: { id: invoice.id },
    body: {
      paymentMethod: 'CASH',
      items: [
        { productId: productControlled.id, quantity: 10 }, // Writes AuditLog
        { productId: productNormal.id, quantity: 5 } // Has exactly 5, will succeed
      ]
    }
  };
  const resSuccess = await runRoute(payInvoice, reqSuccess);
  console.log(`Dispense Result: ${resSuccess.code}`);
  
  const logsSuccess = await AuditLog.findAll();
  console.log(`AuditLogs created after success: ${logsSuccess.length}`);
  if (logsSuccess.length === 1) {
    console.log(`Action: ${logsSuccess[0].action}, User: ${logsSuccess[0].userId}`);
  }
}

runTest().then(() => process.exit(0)).catch(console.error);
