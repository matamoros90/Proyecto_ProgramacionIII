const { Router } = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const { saveBuild, listBuilds, getBuild, updateBuild, deleteBuild } = require('./builds.controller');

const router = Router();

router.use(authenticate);
router.post('/', saveBuild);
router.get('/', listBuilds);
router.get('/:id', getBuild);
router.put('/:id', updateBuild);
router.delete('/:id', deleteBuild);

module.exports = router;
