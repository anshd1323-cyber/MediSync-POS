const { sequelize, Consultation } = require('../models');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');

const bookAppointment = catchAsync(async (req, res) => {
  const { doctorId, scheduledAt, paymentStatus, fee } = req.body;
  const patientId = req.user.id;

  if (!doctorId || !scheduledAt) {
    return res.status(400).json({ success: false, message: 'doctorId and scheduledAt are required fields.' });
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      // Row level locking transaction to block parallel bookings of the exact same slot
      const existing = await Consultation.findOne({
        where: {
          doctorId,
          scheduledAt: new Date(scheduledAt),
          status: { [Op.notIn]: ['CANCELLED'] }
        },
        lock: t.LOCK.UPDATE,
        transaction: t
      });

      if (existing) {
        throw new Error('SLOT_OCCUPIED');
      }

      const appointment = await Consultation.create({
        patientId,
        doctorId,
        status: 'PENDING',
        scheduledAt: new Date(scheduledAt),
        paymentStatus: paymentStatus || 'UNPAID',
        fee: fee || 15.00
      }, { transaction: t });

      return appointment;
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err.message === 'SLOT_OCCUPIED') {
      return res.status(409).json({ success: false, message: 'This consultation slot has already been booked by another patient.' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = { bookAppointment };
