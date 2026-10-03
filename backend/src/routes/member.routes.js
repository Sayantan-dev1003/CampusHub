const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');
const {
  getAllMembers, getMemberById, getMyProfile,
  updateMember, updateAvatar, getExpiringMemberships,
} = require('../controllers/member.controller');

const router = express.Router();

router.use(protect);

// GET /api/v1/members/me
router.get('/me', getMyProfile);

// GET /api/v1/members/expiring
router.get('/expiring', authorize('ADMIN', 'TREASURER'), getExpiringMemberships);

// GET /api/v1/members
router.get('/', authorize('ADMIN', 'TREASURER'), getAllMembers);

// GET /api/v1/members/:id
router.get('/:id', authorize('ADMIN', 'TREASURER'), getMemberById);

// PUT /api/v1/members/:id
router.put('/:id', updateMember);

// POST /api/v1/members/avatar
router.post('/avatar', uploadAvatar.single('avatar'), updateAvatar);

module.exports = router;
