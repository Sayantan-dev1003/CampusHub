const announcementService = require('../services/announcement.service');

const createAnnouncement = async (req, res, next) => {
  try {
    const ann = await announcementService.createAnnouncement(req.body, req.user.id);
    res.status(201).json({ success: true, data: ann });
  } catch (err) { next(err); }
};

const getAllAnnouncements = async (req, res, next) => {
  try {
    const result = await announcementService.getAllAnnouncements(req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getAnnouncementById = async (req, res, next) => {
  try {
    const ann = await announcementService.getAnnouncementById(req.params.id);
    res.json({ success: true, data: ann });
  } catch (err) { next(err); }
};

const updateAnnouncement = async (req, res, next) => {
  try {
    const ann = await announcementService.updateAnnouncement(req.params.id, req.body, req.user);
    res.json({ success: true, data: ann });
  } catch (err) { next(err); }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    await announcementService.deleteAnnouncement(req.params.id);
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (err) { next(err); }
};

module.exports = { createAnnouncement, getAllAnnouncements, getAnnouncementById, updateAnnouncement, deleteAnnouncement };
