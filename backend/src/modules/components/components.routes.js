const { Router } = require('express');
const { authenticate, requireAdmin } = require('../../middleware/auth.middleware');
const { list, getOne, create, update, remove } = require('./components.controller');

const router = Router();

router.get('/', list);
router.get('/:id', getOne);
router.post('/', authenticate, requireAdmin, create);
router.put('/:id', authenticate, requireAdmin, update);
router.delete('/:id', authenticate, requireAdmin, remove);

module.exports = router;
