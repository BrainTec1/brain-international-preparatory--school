const prisma = require('../lib/prisma');

// LIST CLASSES
exports.index = async (req, res) => {
  try {
    const classes = await prisma.schoolClass.findMany({
      include: {
        classTeacher: true,
        _count: { select: { students: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.render('admin/classes/index', {
      title: 'Classes',
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'classes',
      success: req.flash('success'),
      error: req.flash('error'),
      classes,
      total: classes.length,
    });
  } catch (err) {
    console.error('Classes index error:', err);
    req.flash('error', 'Failed to load classes.');
    res.redirect('/admin/dashboard');
  }
};

// SHOW CREATE FORM
exports.create = async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({
      where: { status: 'active' },
      orderBy: { fullName: 'asc' },
    });

    res.render('admin/classes/create', {
      title: 'Add Class',
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'classes',
      success: req.flash('success'),
      error: req.flash('error'),
      teachers,
      formData: {},
      errors: {},
    });
  } catch (err) {
    console.error('Class create form error:', err);
    req.flash('error', 'Failed to load form.');
    res.redirect('/admin/classes');
  }
};

// STORE NEW CLASS
exports.store = async (req, res) => {
  const { name, level, capacity, classTeacherId } = req.body;

  const errors = {};
  if (!name || name.trim().length < 1) errors.name = 'Class name is required.';
  if (!level || !['nursery','kg','lower_primary','upper_primary','jhs'].includes(level)) {
    errors.level = 'Please select a valid level.';
  }
  const cap = parseInt(capacity);
  if (!cap || cap < 1 || cap > 100) errors.capacity = 'Capacity must be between 1 and 100.';

  // Check for duplicate name
  if (!errors.name) {
    const existing = await prisma.schoolClass.findFirst({ where: { name: name.trim() } });
    if (existing) errors.name = 'A class with this name already exists.';
  }

  if (Object.keys(errors).length > 0) {
    const teachers = await prisma.teacher.findMany({ where: { status: 'active' }, orderBy: { fullName: 'asc' } });
    return res.render('admin/classes/create', {
      title: 'Add Class',
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'classes',
      success: [],
      error: ['Please fix the errors below.'],
      teachers,
      formData: req.body,
      errors,
    });
  }

  try {
    const schoolClass = await prisma.schoolClass.create({
      data: {
        name: name.trim(),
        level,
        capacity: cap,
        classTeacherId: classTeacherId ? parseInt(classTeacherId) : null,
      },
    });

    req.flash('success', 'Class "' + schoolClass.name + '" created.');
    res.redirect('/admin/classes');
  } catch (err) {
    console.error('Class store error:', err);
    req.flash('error', 'Failed to save class: ' + err.message);
    res.redirect('/admin/classes/create');
  }
};

// SHOW ONE CLASS
exports.show = async (req, res) => {
  try {
    const schoolClass = await prisma.schoolClass.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        classTeacher: true,
        students: {
          where: { deletedAt: null },
          orderBy: [{ firstName: 'asc' }],
        },
      },
    });

    if (!schoolClass) {
      req.flash('error', 'Class not found.');
      return res.redirect('/admin/classes');
    }

    const counts = {
      total: schoolClass.students.length,
      active: schoolClass.students.filter(s => s.status === 'active').length,
      male: schoolClass.students.filter(s => s.gender === 'male').length,
      female: schoolClass.students.filter(s => s.gender === 'female').length,
    };

    res.render('admin/classes/show', {
      title: schoolClass.name,
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'classes',
      success: req.flash('success'),
      error: req.flash('error'),
      schoolClass,
      counts,
    });
  } catch (err) {
    console.error('Class show error:', err);
    req.flash('error', 'Failed to load class.');
    res.redirect('/admin/classes');
  }
};

// SHOW EDIT FORM
exports.edit = async (req, res) => {
  try {
    const schoolClass = await prisma.schoolClass.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!schoolClass) {
      req.flash('error', 'Class not found.');
      return res.redirect('/admin/classes');
    }

    const teachers = await prisma.teacher.findMany({ where: { status: 'active' }, orderBy: { fullName: 'asc' } });

    res.render('admin/classes/edit', {
      title: 'Edit ' + schoolClass.name,
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'classes',
      success: req.flash('success'),
      error: req.flash('error'),
      schoolClass,
      teachers,
      errors: {},
    });
  } catch (err) {
    console.error('Class edit error:', err);
    req.flash('error', 'Failed to load class.');
    res.redirect('/admin/classes');
  }
};

// UPDATE CLASS
exports.update = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, level, capacity, classTeacherId } = req.body;

  const errors = {};
  if (!name || name.trim().length < 1) errors.name = 'Class name required.';
  if (!level) errors.level = 'Level required.';
  const cap = parseInt(capacity);
  if (!cap || cap < 1) errors.capacity = 'Capacity required.';

  if (!errors.name) {
    const dup = await prisma.schoolClass.findFirst({
      where: { name: name.trim(), id: { not: id } },
    });
    if (dup) errors.name = 'Another class already uses this name.';
  }

  if (Object.keys(errors).length > 0) {
    const schoolClass = await prisma.schoolClass.findUnique({ where: { id } });
    const teachers = await prisma.teacher.findMany({ where: { status: 'active' }, orderBy: { fullName: 'asc' } });
    return res.render('admin/classes/edit', {
      title: 'Edit Class',
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'classes',
      success: [],
      error: ['Please fix the errors below.'],
      schoolClass: Object.assign({}, schoolClass, req.body),
      teachers,
      errors,
    });
  }

  try {
    const schoolClass = await prisma.schoolClass.update({
      where: { id },
      data: {
        name: name.trim(),
        level,
        capacity: cap,
        classTeacherId: classTeacherId ? parseInt(classTeacherId) : null,
      },
    });

    req.flash('success', 'Class updated: ' + schoolClass.name);
    res.redirect('/admin/classes/' + id);
  } catch (err) {
    console.error('Class update error:', err);
    req.flash('error', 'Failed to update class.');
    res.redirect('/admin/classes/' + id + '/edit');
  }
};

// DELETE CLASS
exports.destroy = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const studentCount = await prisma.student.count({
      where: { classId: id, deletedAt: null, status: 'active' },
    });

    if (studentCount > 0) {
      req.flash('error', 'Cannot delete class with ' + studentCount + ' active students. Move them first.');
      return res.redirect('/admin/classes/' + id);
    }

    const schoolClass = await prisma.schoolClass.findUnique({ where: { id } });
    await prisma.schoolClass.delete({ where: { id } });

    req.flash('success', 'Class deleted: ' + (schoolClass ? schoolClass.name : ''));
    res.redirect('/admin/classes');
  } catch (err) {
    console.error('Class delete error:', err);
    req.flash('error', 'Failed to delete class.');
    res.redirect('/admin/classes');
  }
};
