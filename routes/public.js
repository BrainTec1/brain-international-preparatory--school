const express = require('express');
const router = express.Router();

// ─── Public website pages ───

router.get('/', (req, res) => {
  res.render('pages/home', { title: 'Home' });
});

router.get('/about', (req, res) => {
  res.render('pages/about', { title: 'About Us' });
});

router.get('/academics', (req, res) => {
  res.render('pages/academics', { title: 'Academics' });
});

router.get('/admissions', (req, res) => {
  res.render('pages/admissions', { title: 'Admissions' });
});

router.get('/contact', (req, res) => {
  res.render('pages/contact', { title: 'Contact Us' });
});

module.exports = router;
