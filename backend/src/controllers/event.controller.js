const eventService = require('../services/event.service');

const createEvent = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) data.coverImage = `/uploads/events/${req.file.filename}`;
    const event = await eventService.createEvent(data);
    res.status(201).json({ success: true, message: 'Event created', data: event });
  } catch (err) { next(err); }
};

const getAllEvents = async (req, res, next) => {
  try {
    const result = await eventService.getAllEvents(req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getEventById = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
};

const updateEvent = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) data.coverImage = `/uploads/events/${req.file.filename}`;
    const event = await eventService.updateEvent(req.params.id, data);
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
};

const updateEventStatus = async (req, res, next) => {
  try {
    const event = await eventService.updateEventStatus(req.params.id, req.body.status);
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
};

const deleteEvent = async (req, res, next) => {
  try {
    await eventService.deleteEvent(req.params.id);
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) { next(err); }
};

const getEventStats = async (req, res, next) => {
  try {
    const stats = await eventService.getEventStats(req.params.id);
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

module.exports = { createEvent, getAllEvents, getEventById, updateEvent, updateEventStatus, deleteEvent, getEventStats };
