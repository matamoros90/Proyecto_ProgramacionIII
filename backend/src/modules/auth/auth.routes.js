const { Router } = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const { getProfile, registerProfile, saveFcmToken } = require('./auth.controller');

const router = Router();

router.get('/profile', authenticate, getProfile);
router.post('/profile', authenticate, registerProfile);
router.post('/fcm-token', authenticate, saveFcmToken);

module.exports = router;
