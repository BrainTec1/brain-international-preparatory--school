const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');

router.use(requireRole('super-admin', 'admin'));

router.get('/dashboard', (req, res) => {
  res.render('admin/dashboard', {
    title: 'Admin Dashboard',
    layout: 'layouts/portal',
    roleLabel: 'Admin Portal',
    sidebarActive: 'dashboard',
    success: req.flash('success'),
    error: req.flash('error'),
  });
});

module.exports = router;
