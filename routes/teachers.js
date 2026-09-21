const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const teacherController = require('../controllers/teacherController');

router.use(requireRole('super-admin', 'admin'));

router.get('/',              teacherController.index);
router.get('/create',        teacherController.create);
router.post('/',             teacherController.store);
router.get('/:id',           teacherController.show);
router.get('/:id/edit',      teacherController.edit);
router.post('/:id',          teacherController.update);
router.post('/:id/delete',   teacherController.destroy);

module.exports = router;
