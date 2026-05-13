const { Router } = require('express');
const { check } = require('./compatibility.controller');

const router = Router();

router.post('/check', check);

module.exports = router;
