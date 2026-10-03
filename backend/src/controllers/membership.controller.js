const membershipService = require('../services/membership.service');

const createMembership = async (req, res, next) => {
  try {
    const membership = await membershipService.createMembership(req.body, req.user.id);
    res.status(201).json({ success: true, message: 'Membership created', data: membership });
  } catch (err) { next(err); }
};

const getAllMemberships = async (req, res, next) => {
  try {
    const result = await membershipService.getAllMemberships(req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const renewMembership = async (req, res, next) => {
  try {
    const result = await membershipService.renewMembership(req.params.id, req.body, req.user.id);
    res.json({ success: true, message: 'Membership renewed', data: result });
  } catch (err) { next(err); }
};

const updateMembershipStatus = async (req, res, next) => {
  try {
    const result = await membershipService.updateStatus(req.params.id, req.body.status);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

module.exports = { createMembership, getAllMemberships, renewMembership, updateMembershipStatus };
