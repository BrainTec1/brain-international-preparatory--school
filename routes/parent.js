const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');

router.use(requireRole('parent'));

router.get('/dashboard', (req, res) => {
  res.render('parent/dashboard', {
    title: 'Parent Dashboard',
    layout: 'layouts/portal',
    roleLabel: 'Parent Portal',
    sidebarActive: 'dashboard',
    success: req.flash('success'),
    error: req.flash('error'),
  });
});

module.exports = router;
