const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { getDashboardUrl } = require('../middleware/auth');

// ═══════════════════════════════════════════════════════════════
// SHOW LOGIN PAGE — GET /login
// ═══════════════════════════════════════════════════════════════
exports.showLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Sign In',
    layout: 'layouts/blank',
    error: req.flash('error')[0] || null,
    success: req.flash('success'),
    email: '',
  });
};

// ═══════════════════════════════════════════════════════════════
// HANDLE LOGIN — POST /login
// ═══════════════════════════════════════════════════════════════
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    req.flash('error', 'Email and password are required.');
    return res.redirect('/login');
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/login');
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/login');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Store user in session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    req.flash('success', 'Welcome back, ' + user.name + '!');
    return res.redirect(getDashboardUrl(user.role));

  } catch (err) {
    console.error('Login error:', err);
    req.flash('error', 'Something went wrong. Please try again.');
    return res.redirect('/login');
  }
};

// ═══════════════════════════════════════════════════════════════
// LOGOUT — POST /logout
// ═══════════════════════════════════════════════════════════════
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Logout error:', err);
    res.redirect('/login');
  });
};
