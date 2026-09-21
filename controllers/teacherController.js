const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

// LIST TEACHERS
exports.index = async (req, res) => {
  try {
    const { search, status } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { staffId:  { contains: search } },
        { email:    { contains: search } },
        { phone:    { contains: search } },
      ];
    }
    if (status) where.status = status;

    const teachers = await prisma.teacher.findMany({
      where,
      include: { classTeacherOf: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.render('admin/teachers/index', {
      title: 'Teachers',
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'teachers',
      success: req.flash('success'),
      error: req.flash('error'),
      teachers,
      filters: { search: search || '', status: status || '' },
      counts: {
        total: teachers.length,
        active: teachers.filter(t => t.status === 'active').length,
      },
    });
  } catch (err) {
    console.error('Teachers index error:', err);
    req.flash('error', 'Failed to load teachers.');
    res.redirect('/admin/dashboard');
  }
};

// SHOW CREATE FORM
exports.create = async (req, res) => {
  try {
    const classes = await prisma.schoolClass.findMany({ orderBy: { name: 'asc' } });
    res.render('admin/teachers/create', {
      title: 'Add Teacher',
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'teachers',
      success: req.flash('success'),
      error: req.flash('error'),
      classes,
      formData: {},
      errors: {},
    });
  } catch (err) {
    console.error('Teacher create form error:', err);
    req.flash('error', 'Failed to load form.');
    res.redirect('/admin/teachers');
  }
};

// STORE NEW TEACHER
exports.store = async (req, res) => {
  const { fullName, phone, email, qualification, hireDate, status, classIds } = req.body;

  const errors = {};
  if (!fullName || fullName.trim().length < 2) errors.fullName = 'Full name is required.';
  if (!phone || phone.trim().length < 6) errors.phone = 'Phone number is required.';
  if (!email || !email.includes('@')) errors.email = 'Valid email is required.';
  if (!hireDate) errors.hireDate = 'Hire date is required.';

  if (Object.keys(errors).length > 0) {
    const classes = await prisma.schoolClass.findMany({ orderBy: { name: 'asc' } });
    return res.render('admin/teachers/create', {
      title: 'Add Teacher',
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'teachers',
      success: [],
      error: ['Please fix the errors below.'],
      classes,
      formData: req.body,
      errors,
    });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existing) {
      const classes = await prisma.schoolClass.findMany({ orderBy: { name: 'asc' } });
      return res.render('admin/teachers/create', {
        title: 'Add Teacher',
        layout: 'layouts/portal',
        roleLabel: 'Admin Portal',
        sidebarActive: 'teachers',
        success: [],
        error: ['A user with that email already exists.'],
        classes,
        formData: req.body,
        errors: { email: 'Email is already in use.' },
      });
    }

    // Generate staff ID
    const year = new Date().getFullYear();
    const count = await prisma.teacher.count({
      where: { staffId: { startsWith: 'TCH/' + year + '/' } },
    });
    const staffId = 'TCH/' + year + '/' + String(count + 1).padStart(3, '0');

    // Default password: teacher's first name + last 4 of phone
    const defaultPassword = 'Teacher@' + phone.trim().slice(-4);
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create user + teacher in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password: hashedPassword,
          role: 'teacher',
          isActive: true,
        },
      });

      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          staffId,
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          qualification: qualification ? qualification.trim() : null,
          hireDate: new Date(hireDate),
          status: status || 'active',
        },
      });

      return { user, teacher, defaultPassword };
    });

    req.flash('success',
      'Teacher "' + result.teacher.fullName + '" added. Staff ID: ' + staffId +
      ' — Login: ' + email + ' / Password: ' + defaultPassword
    );
    res.redirect('/admin/teachers');
  } catch (err) {
    console.error('Teacher store error:', err);
    req.flash('error', 'Failed to save teacher: ' + err.message);
    res.redirect('/admin/teachers/create');
  }
};

// SHOW ONE TEACHER
exports.show = async (req, res) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { classTeacherOf: true, user: true },
    });

    if (!teacher) {
      req.flash('error', 'Teacher not found.');
      return res.redirect('/admin/teachers');
    }

    res.render('admin/teachers/show', {
      title: teacher.fullName,
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'teachers',
      success: req.flash('success'),
      error: req.flash('error'),
      teacher,
    });
  } catch (err) {
    console.error('Teacher show error:', err);
    req.flash('error', 'Failed to load teacher.');
    res.redirect('/admin/teachers');
  }
};

// SHOW EDIT FORM
exports.edit = async (req, res) => {
  try {
    const teacher = await prisma.teacher.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!teacher) {
      req.flash('error', 'Teacher not found.');
      return res.redirect('/admin/teachers');
    }

    const classes = await prisma.schoolClass.findMany({ orderBy: { name: 'asc' } });
    res.render('admin/teachers/edit', {
      title: 'Edit ' + teacher.fullName,
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'teachers',
      success: req.flash('success'),
      error: req.flash('error'),
      teacher,
      classes,
      errors: {},
    });
  } catch (err) {
    console.error('Teacher edit error:', err);
    req.flash('error', 'Failed to load teacher.');
    res.redirect('/admin/teachers');
  }
};

// UPDATE TEACHER
exports.update = async (req, res) => {
  const id = parseInt(req.params.id);
  const { fullName, phone, qualification, hireDate, status } = req.body;

  const errors = {};
  if (!fullName || fullName.trim().length < 2) errors.fullName = 'Full name required.';
  if (!phone || phone.trim().length < 6) errors.phone = 'Phone required.';
  if (!hireDate) errors.hireDate = 'Hire date required.';

  if (Object.keys(errors).length > 0) {
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    const classes = await prisma.schoolClass.findMany({ orderBy: { name: 'asc' } });
    return res.render('admin/teachers/edit', {
      title: 'Edit Teacher',
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'teachers',
      success: [],
      error: ['Please fix the errors below.'],
      teacher: Object.assign({}, teacher, req.body),
      classes,
      errors,
    });
  }

  try {
    const teacher = await prisma.teacher.update({
      where: { id },
      data: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        qualification: qualification ? qualification.trim() : null,
        hireDate: new Date(hireDate),
        status: status || 'active',
      },
    });

    // Also update the linked user's name
    if (teacher.userId) {
      await prisma.user.update({
        where: { id: teacher.userId },
        data: { name: fullName.trim() },
      });
    }

    req.flash('success', 'Teacher updated: ' + teacher.fullName);
    res.redirect('/admin/teachers/' + id);
  } catch (err) {
    console.error('Teacher update error:', err);
    req.flash('error', 'Failed to update teacher.');
    res.redirect('/admin/teachers/' + id + '/edit');
  }
};

// ARCHIVE TEACHER
exports.destroy = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const teacher = await prisma.teacher.update({
      where: { id },
      data: { status: 'inactive' },
    });

    if (teacher.userId) {
      await prisma.user.update({
        where: { id: teacher.userId },
        data: { isActive: false },
      });
    }

    req.flash('success', 'Teacher archived: ' + teacher.fullName);
    res.redirect('/admin/teachers');
  } catch (err) {
    console.error('Teacher delete error:', err);
    req.flash('error', 'Failed to archive teacher.');
    res.redirect('/admin/teachers');
  }
};
