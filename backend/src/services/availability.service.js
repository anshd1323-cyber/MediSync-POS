const { DoctorAvailability, Consultation, User } = require('../models');
const ApiError = require('../utils/ApiError');
const { Op } = require('sequelize');
const moment = require('moment');

async function setAvailability(doctorId, availabilities) {
  // Clear old availabilities
  await DoctorAvailability.destroy({ where: { doctorId } });
  
  const records = availabilities.map(a => ({
    doctorId,
    dayOfWeek: a.dayOfWeek,
    startTime: a.startTime,
    endTime: a.endTime,
    slotDuration: a.slotDuration || 30,
    bufferTime: a.bufferTime !== undefined ? a.bufferTime : 10
  }));
  
  return DoctorAvailability.bulkCreate(records);
}

async function getAvailability(doctorId) {
  return DoctorAvailability.findAll({ where: { doctorId }, order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']] });
}

async function getAvailableSlots(doctorId, dateStr) {
  // We parse the date strictly in YYYY-MM-DD
  const date = moment(dateStr, 'YYYY-MM-DD');
  if (!date.isValid()) {
    throw new ApiError(400, 'Invalid date format. Use YYYY-MM-DD');
  }

  const dayOfWeek = date.day(); // 0-6 (0=Sunday, 6=Saturday)

  const rules = await DoctorAvailability.findAll({ where: { doctorId, dayOfWeek } });
  if (!rules.length) return [];

  // Find all consultations for this doctor on this day
  // To avoid timezone shift issues, we check between 00:00:00 and 23:59:59 of the selected day in UTC
  const startOfDay = moment.utc(dateStr).startOf('day').toDate();
  const endOfDay = moment.utc(dateStr).endOf('day').toDate();
  
  const bookedConsultations = await Consultation.findAll({
    where: {
      doctorId,
      status: { [Op.notIn]: ['COMPLETED', 'CANCELLED'] },
      scheduledAt: {
        [Op.between]: [startOfDay, endOfDay]
      }
    }
  });

  // Map booked consultations into a timezone-agnostic time representation (HH:mm in local time range)
  const bookedTimes = bookedConsultations.map(c => moment.utc(c.scheduledAt).format('HH:mm'));
  let slots = [];

  for (const rule of rules) {
    let current = moment.utc(`${dateStr} ${rule.startTime}`, 'YYYY-MM-DD HH:mm');
    const end = moment.utc(`${dateStr} ${rule.endTime}`, 'YYYY-MM-DD HH:mm');
    const stepDuration = rule.slotDuration + (rule.bufferTime || 0);

    while (current.isBefore(end)) {
      // Slot end time is when the active consultation session would finish (before buffer starts)
      const slotEnd = moment(current).add(rule.slotDuration, 'minutes');
      if (slotEnd.isAfter(end)) break; // Cannot fit full slot duration before shift ends

      const timeStr = current.format('HH:mm');
      if (!bookedTimes.includes(timeStr)) {
        slots.push({
          time: timeStr,
          duration: rule.slotDuration,
          buffer: rule.bufferTime,
          // Datetime returned as a clear ISO UTC string to prevent shifts
          datetime: current.toISOString()
        });
      }
      current.add(stepDuration, 'minutes');
    }
  }

  return slots;
}

module.exports = { setAvailability, getAvailability, getAvailableSlots };
