const ticketService = require('../services/ticket.service');

const purchaseTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.purchaseTicket(req.body, req.user.id);
    res.status(201).json({ success: true, message: 'Ticket purchased', data: ticket });
  } catch (err) { next(err); }
};

const checkInTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.checkInTicket(req.body.qrCode, req.user.id);
    res.json({ success: true, message: 'Check-in successful', data: ticket });
  } catch (err) { next(err); }
};

const getAllTickets = async (req, res, next) => {
  try {
    const result = await ticketService.getAllTickets(req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getTicketById = async (req, res, next) => {
  try {
    const ticket = await ticketService.getTicketById(req.params.id);
    res.json({ success: true, data: ticket });
  } catch (err) { next(err); }
};

const cancelTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.cancelTicket(req.params.id);
    res.json({ success: true, message: 'Ticket cancelled', data: ticket });
  } catch (err) { next(err); }
};

module.exports = { purchaseTicket, checkInTicket, getAllTickets, getTicketById, cancelTicket };
