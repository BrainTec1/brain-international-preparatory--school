const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const parentController = require('../controllers/parentController');

router.use(requireRole('super-admin', 'admin'));

router.get('/',                            parentController.index);
router.get('/create',                      parentController.create);
router.post('/',                           parentController.store);
router.get('/:id',                         parentController.show);
router.get('/:id/edit',                    parentController.edit);
router.post('/:id',                        parentController.update);
router.post('/:id/link-child',             parentController.linkChild);
router.post('/:id/unlink-child/:studentId',parentController.unlinkChild);
router.post('/:id/delete',                 parentController.destroy);

module.exports = router;
