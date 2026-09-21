const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const academicYearController = require('../controllers/academicYearController');

router.use(requireRole('super-admin', 'admin'));

router.get('/',                        academicYearController.index);
router.get('/create',                  academicYearController.create);
router.post('/',                       academicYearController.store);
router.post('/:id/set-current',        academicYearController.setCurrent);
router.post('/term/:termId/set-current', academicYearController.setCurrentTerm);
router.post('/:id/delete',             academicYearController.destroy);

module.exports = router;
