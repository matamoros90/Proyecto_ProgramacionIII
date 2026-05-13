const { Router } = require('express');
const { authenticate, requireAdmin } = require('../../middleware/auth.middleware');
const { list, getOne, create, update } = require('./tutorials.controller');

const router = Router();

router.get('/', list);
router.get('/:id', getOne);
router.post('/', authenticate, requireAdmin, create);
router.put('/:id', authenticate, requireAdmin, update);

module.exports = router;
