const { Router } = require('express');
const { recommend, swap } = require('./recommendations.controller');

const router = Router();

router.post('/generate', recommend);
router.post('/swap', swap);

module.exports = router;
