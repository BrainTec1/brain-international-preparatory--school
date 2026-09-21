const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

// LIST PARENTS
exports.index = async (req, res) => {
  try {
    const { search, relationship } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { phone:    { contains: search } },
        { email:    { contains: search } },
      ];
    }
    if (relationship) where.relationship = relationship;

    const parents = await prisma.parent.findMany({
      where,
      include: { children: { include: { student: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.render('admin/parents/index', {
      title: 'Parents',
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'parents',
      success: req.flash('success'),
      error: req.flash('error'),
      parents,
      filters: { search: search || '', relationship: relationship || '' },
      counts: {
        total: parents.length,
        withChildren: parents.filter(p => p.children.length > 0).length,
      },
    });
  } catch (err) {
    console.error('Parents index error:', err);
    req.flash('error', 'Failed to load parents.');
    res.redirect('/admin/dashboard');
  }
};

// SHOW CREATE FORM
exports.create = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      where: { deletedAt: null, status: 'active' },
      include: { class: true },
      orderBy: { firstName: 'asc' },
    });

    res.render('admin/parents/create', {
      title: 'Add Parent',
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'parents',
      success: req.flash('success'),
      error: req.flash('error'),
      students,
      formData: {},
      errors: {},
    });
  } catch (err) {
    console.error('Parent create form error:', err);
    req.flash('error', 'Failed to load form.');
    res.redirect('/admin/parents');
  }
};

// STORE NEW PARENT
exports.store = async (req, res) => {
  const { fullName, phone, email, occupation, address, relationship, password } = req.body;

  const errors = {};
  if (!fullName || fullName.trim().length < 2) errors.fullName = 'Full name is required.';
  if (!phone || phone.trim().length < 6) errors.phone = 'Phone number is required.';
  if (email && !email.includes('@')) errors.email = 'Please enter a valid email.';
  if (!relationship || !['father', 'mother', 'guardian'].includes(relationship)) {
    errors.relationship = 'Please select a relationship.';
  }

  if (Object.keys(errors).length > 0) {
    const students = await prisma.student.findMany({
      where: { deletedAt: null, status: 'active' },
      include: { class: true },
      orderBy: { firstName: 'asc' },
    });
    return res.render('admin/parents/create', {
      title: 'Add Parent',
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'parents',
      success: [],
      error: ['Please fix the errors below.'],
      students,
      formData: req.body,
      errors,
    });
  }

  try {
    let userId = null;
    let credentials = null;

    // If email provided, create a user account
    if (email && email.trim()) {
      const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
      if (existing) {
        const students = await prisma.student.findMany({
          where: { deletedAt: null, status: 'active' },
          include: { class: true },
          orderBy: { firstName: 'asc' },
        });
        return res.render('admin/parents/create', {
          title: 'Add Parent',
          layout: 'layouts/portal',
          roleLabel: 'Admin Portal',
          sidebarActive: 'parents',
          success: [],
          error: ['A user with that email already exists.'],
          students,
          formData: req.body,
          errors: { email: 'Email is already in use.' },
        });
      }

      const plainPassword = password && password.length >= 6
        ? password
        : 'Parent@' + phone.trim().slice(-4);
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const user = await prisma.user.create({
        data: {
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password: hashedPassword,
          role: 'parent',
          isActive: true,
        },
      });
      userId = user.id;
      credentials = { email: email.trim().toLowerCase(), password: plainPassword };
    }

    const parent = await prisma.parent.create({
      data: {
        userId,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email ? email.trim().toLowerCase() : null,
        occupation: occupation ? occupation.trim() : null,
        address: address ? address.trim() : null,
        relationship,
      },
    });

    const successMsg = credentials
      ? 'Parent "' + parent.fullName + '" added. Login: ' + credentials.email + ' / Password: ' + credentials.password
      : 'Parent "' + parent.fullName + '" added.';

    req.flash('success', successMsg);
    res.redirect('/admin/parents');
  } catch (err) {
    console.error('Parent store error:', err);
    req.flash('error', 'Failed to save parent: ' + err.message);
    res.redirect('/admin/parents/create');
  }
};

// SHOW ONE PARENT
exports.show = async (req, res) => {
  try {
    const parent = await prisma.parent.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        children: { include: { student: { include: { class: true } } } },
        user: true,
      },
    });

    if (!parent) {
      req.flash('error', 'Parent not found.');
      return res.redirect('/admin/parents');
    }

    const allStudents = await prisma.student.findMany({
      where: { deletedAt: null, status: 'active' },
      include: { class: true },
      orderBy: { firstName: 'asc' },
    });

    const linkedIds = parent.children.map(c => c.studentId);
    const availableStudents = allStudents.filter(s => !linkedIds.includes(s.id));

    res.render('admin/parents/show', {
      title: parent.fullName,
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'parents',
      success: req.flash('success'),
      error: req.flash('error'),
      parent,
      availableStudents,
    });
  } catch (err) {
    console.error('Parent show error:', err);
    req.flash('error', 'Failed to load parent.');
    res.redirect('/admin/parents');
  }
};

// SHOW EDIT FORM
exports.edit = async (req, res) => {
  try {
    const parent = await prisma.parent.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!parent) {
      req.flash('error', 'Parent not found.');
      return res.redirect('/admin/parents');
    }

    res.render('admin/parents/edit', {
      title: 'Edit ' + parent.fullName,
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'parents',
      success: req.flash('success'),
      error: req.flash('error'),
      parent,
      errors: {},
    });
  } catch (err) {
    console.error('Parent edit error:', err);
    req.flash('error', 'Failed to load parent.');
    res.redirect('/admin/parents');
  }
};

// UPDATE PARENT
exports.update = async (req, res) => {
  const id = parseInt(req.params.id);
  const { fullName, phone, occupation, address, relationship } = req.body;

  const errors = {};
  if (!fullName || fullName.trim().length < 2) errors.fullName = 'Full name required.';
  if (!phone || phone.trim().length < 6) errors.phone = 'Phone required.';
  if (!relationship) errors.relationship = 'Relationship required.';

  if (Object.keys(errors).length > 0) {
    const parent = await prisma.parent.findUnique({ where: { id } });
    return res.render('admin/parents/edit', {
      title: 'Edit Parent',
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'parents',
      success: [],
      error: ['Please fix the errors below.'],
      parent: Object.assign({}, parent, req.body),
      errors,
    });
  }

  try {
    const parent = await prisma.parent.update({
      where: { id },
      data: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        occupation: occupation ? occupation.trim() : null,
        address: address ? address.trim() : null,
        relationship,
      },
    });

    if (parent.userId) {
      await prisma.user.update({
        where: { id: parent.userId },
        data: { name: fullName.trim() },
      });
    }

    req.flash('success', 'Parent updated: ' + parent.fullName);
    res.redirect('/admin/parents/' + id);
  } catch (err) {
    console.error('Parent update error:', err);
    req.flash('error', 'Failed to update parent.');
    res.redirect('/admin/parents/' + id + '/edit');
  }
};

// LINK CHILD
exports.linkChild = async (req, res) => {
  try {
    const parentId = parseInt(req.params.id);
    const studentId = parseInt(req.body.studentId);

    if (!studentId) {
      req.flash('error', 'Please select a student.');
      return res.redirect('/admin/parents/' + parentId);
    }

    await prisma.parentStudent.upsert({
      where: { parentId_studentId: { parentId, studentId } },
      update: {},
      create: { parentId, studentId },
    });

    req.flash('success', 'Child linked successfully.');
    res.redirect('/admin/parents/' + parentId);
  } catch (err) {
    console.error('Link child error:', err);
    req.flash('error', 'Failed to link child.');
    res.redirect('/admin/parents/' + req.params.id);
  }
};

// UNLINK CHILD
exports.unlinkChild = async (req, res) => {
  try {
    const parentId = parseInt(req.params.id);
    const studentId = parseInt(req.params.studentId);

    await prisma.parentStudent.deleteMany({
      where: { parentId, studentId },
    });

    req.flash('success', 'Child unlinked.');
    res.redirect('/admin/parents/' + parentId);
  } catch (err) {
    console.error('Unlink child error:', err);
    req.flash('error', 'Failed to unlink child.');
    res.redirect('/admin/parents/' + req.params.id);
  }
};

// ARCHIVE PARENT
exports.destroy = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const parent = await prisma.parent.findUnique({ where: { id } });

    if (!parent) {
      req.flash('error', 'Parent not found.');
      return res.redirect('/admin/parents');
    }

    // Deactivate linked user
    if (parent.userId) {
      await prisma.user.update({
        where: { id: parent.userId },
        data: { isActive: false },
      });
    }

    await prisma.parent.delete({ where: { id } });

    req.flash('success', 'Parent removed: ' + parent.fullName);
    res.redirect('/admin/parents');
  } catch (err) {
    console.error('Parent delete error:', err);
    req.flash('error', 'Failed to remove parent.');
    res.redirect('/admin/parents');
  }
};
