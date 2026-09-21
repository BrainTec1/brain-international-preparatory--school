const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const studentController = require('../controllers/studentController');

router.use(requireRole('super-admin', 'admin'));

router.get('/',              studentController.index);
router.get('/create',        studentController.create);
router.post('/',             studentController.store);
router.get('/:id',           studentController.show);
router.get('/:id/edit',      studentController.edit);
router.post('/:id',          studentController.update);
router.post('/:id/delete',   studentController.destroy);

module.exports = router;
