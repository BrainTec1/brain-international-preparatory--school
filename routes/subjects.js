const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const subjectController = require('../controllers/subjectController');

router.use(requireRole('super-admin', 'admin'));

router.get('/',              subjectController.index);
router.get('/create',        subjectController.create);
router.post('/',             subjectController.store);
router.get('/:id/edit',      subjectController.edit);
router.post('/:id',          subjectController.update);
router.post('/:id/delete',   subjectController.destroy);

module.exports = router;
