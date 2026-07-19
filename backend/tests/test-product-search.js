const { sequelize, Clinic, User, Product } = require('../src/models');
const { searchProducts } = require('../src/controllers/product.controller');

async function runTest() {
  await sequelize.sync({ force: true });
  
  const clinic = await Clinic.create({
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Clinic',
    address: '123 Test St',
    latitude: 10,
    longitude: 20,
    subscriptionStatus: 'ACTIVE',
    subscriptionExpiresAt: new Date(Date.now() + 1000000)
  });
  
  const doctor = await User.create({
    name: 'Dr. Test',
    email: 'doc@test.com',
    password: 'pass',
    role: 'DOCTOR',
    clinicId: clinic.id
  });

  await Product.create({
    clinicId: clinic.id,
    name: 'Amoxicillin 500mg',
    sku: 'AMX-500',
    price: 15.00,
    stockQuantity: 100
  });

  await Product.create({
    clinicId: clinic.id,
    name: 'Ibuprofen 400mg',
    sku: 'IBU-400',
    price: 8.00,
    stockQuantity: 50
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

  console.log('--- TEST: Product Search for "amox" ---');
  const reqSearch = {
    user: { clinicId: clinic.id },
    query: { query: 'amox' }
  };
  
  const resSearch = await runRoute(searchProducts, reqSearch);
  console.log(JSON.stringify(resSearch, null, 2));
}

runTest().then(() => process.exit(0)).catch(console.error);
