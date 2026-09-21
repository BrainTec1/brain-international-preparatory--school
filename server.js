require('dotenv').config();
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const methodOverride = require('method-override');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true, secure: false },
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentPath = req.path;
  res.locals.title = 'Brain International School';
  res.locals.roleLabel = '';
  res.locals.sidebarActive = '';
  next();
});

const publicRoutes        = require('./routes/public');
const authRoutes          = require('./routes/auth');
const adminRoutes         = require('./routes/admin');
const adminStudentRoutes  = require('./routes/students');
const adminTeacherRoutes  = require('./routes/teachers');
const adminParentRoutes   = require('./routes/parents');
const teacherRoutes       = require('./routes/teacher');
const parentRoutes        = require('./routes/parent');
const studentPortalRoutes = require('./routes/student');

app.use('/', publicRoutes);
app.use('/', authRoutes);
app.use('/admin/students', adminStudentRoutes);
app.use('/admin/teachers', adminTeacherRoutes);
app.use('/admin/parents',  adminParentRoutes);
app.use('/admin',   adminRoutes);
app.use('/teacher', teacherRoutes);
app.use('/parent',  parentRoutes);
app.use('/student', studentPortalRoutes);

app.use((req, res) => {
  res.status(404).render('pages/404', { title: 'Page Not Found', layout: 'layouts/blank' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 BIS server running at http://localhost:' + PORT);
});
