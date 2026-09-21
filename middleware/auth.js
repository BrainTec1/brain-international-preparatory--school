// ═══════════════════════════════════════════════════════════════
// AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

/**
 * requireAuth — redirects to /login if not authenticated
 */
function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.flash('error', 'Please log in to continue.');
    return res.redirect('/login');
  }
  next();
}

/**
 * requireGuest — redirects away if already logged in
 */
function requireGuest(req, res, next) {
  if (req.session.user) {
    return res.redirect(getDashboardUrl(req.session.user.role));
  }
  next();
}

/**
 * requireRole('admin', 'super-admin') — allows only specific roles
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user) {
      req.flash('error', 'Please log in to continue.');
      return res.redirect('/login');
    }
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).render('pages/403', {
        title: 'Access Denied',
        layout: 'layouts/blank',
      });
    }
    next();
  };
}

/**
 * getDashboardUrl(role) — maps role to their dashboard
 */
function getDashboardUrl(role) {
  const map = {
    'super-admin': '/admin/dashboard',
    'admin':       '/admin/dashboard',
    'teacher':     '/teacher/dashboard',
    'parent':      '/parent/dashboard',
    'student':     '/student/dashboard',
  };
  return map[role] || '/';
}

module.exports = {
  requireAuth,
  requireGuest,
  requireRole,
  getDashboardUrl,
};
