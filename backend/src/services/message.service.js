const { Message, Consultation, User } = require('../models');
const ApiError = require('../utils/ApiError');
const { assertIsParticipant } = require('./consultation.service');

async function sendMessage(consultationId, sender, text) {
  const consultation = await Consultation.findByPk(consultationId);

  if (!consultation) {
    throw new ApiError(404, 'Consultation not found');
  }

  assertIsParticipant(consultation, sender);

  if (consultation.status === 'COMPLETED') {
    throw new ApiError(400, 'Cannot send messages in a completed consultation');
  }

  return Message.create({
    consultationId,
    senderId: sender.id,
    message: text,
  });
}

async function getMessages(consultationId, user) {
  const consultation = await Consultation.findByPk(consultationId);

  if (!consultation) {
    throw new ApiError(404, 'Consultation not found');
  }

  assertIsParticipant(consultation, user);

  return Message.findAll({
    where: { consultationId },
    include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'role'] }],
    order: [['timestamp', 'ASC']],
  });
}

module.exports = { sendMessage, getMessages };
