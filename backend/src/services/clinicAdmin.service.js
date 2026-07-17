const { User, DoctorProfile, Tenant, License, Visit, Bill, Patient, FeatureFlag } = require('../models');
const { Op } = require('sequelize');
const ApiError = require('../utils/ApiError');

/**
 * Get clinic dashboard data.
 */
async function getClinicDashboard(tenantId) {
  const today = new Date().toISOString().split('T')[0];

  // Today's stats
  const todayVisits = await Visit.count({ where: { tenantId, visitDate: today } });
  const todayCompleted = await Visit.count({ where: { tenantId, visitDate: today, status: 'COMPLETED' } });
  const todayWaiting = await Visit.count({ where: { tenantId, visitDate: today, status: 'WAITING' } });
  const todayInConsultation = await Visit.count({ where: { tenantId, visitDate: today, status: 'IN_CONSULTATION' } });

  // Today's revenue
  const startOfDay = new Date(today);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const todayRevenue = await Bill.sum('total', {
    where: {
      tenantId,
      createdAt: { [Op.between]: [startOfDay, endOfDay] },
      paymentStatus: { [Op.in]: ['PAID', 'PARTIAL'] },
    },
  }) || 0;

  // Total patients
  const totalPatients = await Patient.count({ where: { tenantId } });

  // Staff on duty
  const staffOnDuty = await User.count({ where: { tenantId, isActive: true } });

  // Recent visits
  const recentVisits = await Visit.findAll({
    where: { tenantId, visitDate: today },
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'name', 'phone'] },
      { model: User, as: 'doctor', attributes: ['id', 'name'] },
    ],
    order: [['tokenNo', 'DESC']],
    limit: 10,
  });

  return {
    today: {
      visits: todayVisits,
      completed: todayCompleted,
      waiting: todayWaiting,
      inConsultation: todayInConsultation,
      revenue: parseFloat(todayRevenue),
    },
    totalPatients,
    staffOnDuty,
    recentVisits,
  };
}

/**
 * Get staff list for a clinic.
 */
async function getStaffList(tenantId) {
  return User.findAll({
    where: { tenantId },
    attributes: ['id', 'name', 'email', 'role', 'isActive', 'createdAt'],
    include: [{ model: DoctorProfile, as: 'doctorProfile' }],
    order: [['role', 'ASC'], ['name', 'ASC']],
  });
}

/**
 * Update a staff member.
 */
async function updateStaff(tenantId, staffId, data) {
  const user = await User.findOne({ where: { id: staffId, tenantId } });
  if (!user) throw new ApiError(404, 'Staff member not found');

  if (user.role === 'CLINIC_ADMIN' && data.role && data.role !== 'CLINIC_ADMIN') {
    throw new ApiError(400, 'Cannot change the role of the clinic admin');
  }

  if (data.isActive !== undefined) user.isActive = data.isActive;
  if (data.name) user.name = data.name;
  await user.save();

  return user;
}

/**
 * Get subscription info for a clinic.
 */
async function getSubscription(tenantId) {
  const tenant = await Tenant.findByPk(tenantId, {
    include: [{ model: License, as: 'license' }],
  });
  if (!tenant) throw new ApiError(404, 'Clinic not found');

  // Get feature flags for current plan
  let features = [];
  if (tenant.license?.plan) {
    const flags = await FeatureFlag.findAll({
      where: { plan: tenant.license.plan, enabled: true },
    });
    features = flags.map(f => f.featureKey);
  }

  return {
    tenant: { id: tenant.id, name: tenant.name },
    license: tenant.license,
    features,
  };
}

/**
 * Get revenue report for a clinic.
 */
async function getRevenueReport(tenantId, { startDate, endDate, groupBy = 'day' }) {
  const where = { tenantId, paymentStatus: { [Op.in]: ['PAID', 'PARTIAL'] } };

  if (startDate) {
    where.createdAt = where.createdAt || {};
    where.createdAt[Op.gte] = new Date(startDate);
  }
  if (endDate) {
    where.createdAt = where.createdAt || {};
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    where.createdAt[Op.lte] = end;
  }

  const bills = await Bill.findAll({
    where,
    order: [['createdAt', 'ASC']],
  });

  // Aggregate by day
  const dailyRevenue = {};
  let totalRevenue = 0;
  let totalBills = 0;

  for (const bill of bills) {
    const day = bill.createdAt.toISOString().split('T')[0];
    if (!dailyRevenue[day]) {
      dailyRevenue[day] = { date: day, revenue: 0, bills: 0, cash: 0, upi: 0, card: 0 };
    }
    const amount = parseFloat(bill.total) || 0;
    dailyRevenue[day].revenue += amount;
    dailyRevenue[day].bills += 1;
    dailyRevenue[day][bill.paymentMode.toLowerCase()] = (dailyRevenue[day][bill.paymentMode.toLowerCase()] || 0) + amount;
    totalRevenue += amount;
    totalBills += 1;
  }

  return {
    daily: Object.values(dailyRevenue),
    totalRevenue,
    totalBills,
  };
}

/**
 * Get list of doctors in a clinic.
 */
async function getDoctors(tenantId) {
  return User.findAll({
    where: { tenantId, role: 'DOCTOR', isActive: true },
    attributes: ['id', 'name', 'email'],
    include: [{ model: DoctorProfile, as: 'doctorProfile' }],
  });
}

module.exports = {
  getClinicDashboard,
  getStaffList,
  updateStaff,
  getSubscription,
  getRevenueReport,
  getDoctors,
};
