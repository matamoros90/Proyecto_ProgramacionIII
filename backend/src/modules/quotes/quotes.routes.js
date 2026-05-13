const { Router } = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const { create, list, getOne, confirm } = require('./quotes.controller');

const router = Router();

router.use(authenticate);
router.post('/', create);
router.get('/', list);
router.get('/:id', getOne);
router.patch('/:id/confirm', confirm);

module.exports = router;
