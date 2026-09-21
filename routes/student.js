const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');

router.use(requireRole('student'));

router.get('/dashboard', (req, res) => {
  res.render('student/dashboard', {
    title: 'Student Dashboard',
    layout: 'layouts/portal',
    roleLabel: 'Student Portal',
    sidebarActive: 'dashboard',
    success: req.flash('success'),
    error: req.flash('error'),
  });
});

module.exports = router;
