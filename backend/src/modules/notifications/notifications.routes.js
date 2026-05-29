const { Router } = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const ctrl = require('./notifications.controller');

const router = Router();

router.use(authenticate);

router.get('/',           ctrl.list);
router.get('/unread',     ctrl.unreadCount);
router.patch('/read-all', ctrl.markAllRead);
router.patch('/:id/read', ctrl.markRead);
router.delete('/:id',     ctrl.remove);

module.exports = router;
