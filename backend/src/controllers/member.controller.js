const memberService = require('../services/member.service');

const getAllMembers = async (req, res, next) => {
  try {
    const result = await memberService.getAllMembers(req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getMemberById = async (req, res, next) => {
  try {
    const member = await memberService.getMemberById(req.params.id);
    res.json({ success: true, data: member });
  } catch (err) { next(err); }
};

const getMyProfile = async (req, res, next) => {
  try {
    // Find member linked to logged-in user
    const prisma = require('../config/db');
    const member = await prisma.member.findUnique({
      where: { userId: req.user.id },
      include: { memberships: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    if (!member) return res.status(404).json({ success: false, message: 'Member profile not found' });
    res.json({ success: true, data: member });
  } catch (err) { next(err); }
};

const updateMember = async (req, res, next) => {
  try {
    const updated = await memberService.updateMember(req.params.id, req.body, req.user);
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const profilePhoto = `/uploads/avatars/${req.file.filename}`;
    const prisma = require('../config/db');
    const member = await prisma.member.findUnique({ where: { userId: req.user.id } });
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    const updated = await memberService.updateMember(member.id, { profilePhoto }, req.user);
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

const getExpiringMemberships = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const memberships = await memberService.getExpiringMemberships(days);
    res.json({ success: true, data: memberships });
  } catch (err) { next(err); }
};

module.exports = { getAllMembers, getMemberById, getMyProfile, updateMember, updateAvatar, getExpiringMemberships };
