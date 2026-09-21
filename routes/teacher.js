const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');

router.use(requireRole('teacher'));

router.get('/dashboard', (req, res) => {
  res.render('teacher/dashboard', {
    title: 'Teacher Dashboard',
    layout: 'layouts/portal',
    roleLabel: 'Teacher Portal',
    sidebarActive: 'dashboard',
    success: req.flash('success'),
    error: req.flash('error'),
  });
});

module.exports = router;
