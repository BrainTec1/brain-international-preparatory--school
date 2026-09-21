const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const classController = require('../controllers/classController');

router.use(requireRole('super-admin', 'admin'));

router.get('/',              classController.index);
router.get('/create',        classController.create);
router.post('/',             classController.store);
router.get('/:id',           classController.show);
router.get('/:id/edit',      classController.edit);
router.post('/:id',          classController.update);
router.post('/:id/delete',   classController.destroy);

module.exports = router;
