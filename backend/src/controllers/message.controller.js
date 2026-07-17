const messageService = require('../services/message.service');
const catchAsync = require('../utils/catchAsync');

const sendMessage = catchAsync(async (req, res) => {
  const message = await messageService.sendMessage(req.params.id, req.user, req.body.message);
  res.status(201).json({ success: true, data: message });
});

const getMessages = catchAsync(async (req, res) => {
  const messages = await messageService.getMessages(req.params.id, req.user);
  res.status(200).json({ success: true, data: messages });
});

module.exports = { sendMessage, getMessages };
