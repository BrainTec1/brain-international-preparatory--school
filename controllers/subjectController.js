const prisma = require('../lib/prisma');

// LIST SUBJECTS
exports.index = async (req, res) => {
  try {
    const { search, level } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
      ];
    }
    if (level) where.level = level;

    const subjects = await prisma.subject.findMany({
      where,
      orderBy: [{ level: 'asc' }, { name: 'asc' }],
    });

    res.render('admin/subjects/index', {
      title: 'Subjects',
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'subjects',
      success: req.flash('success'),
      error: req.flash('error'),
      subjects,
      filters: { search: search || '', level: level || '' },
      total: subjects.length,
    });
  } catch (err) {
    console.error('Subjects index error:', err);
    req.flash('error', 'Failed to load subjects.');
    res.redirect('/admin/dashboard');
  }
};

// SHOW CREATE FORM
exports.create = async (req, res) => {
  res.render('admin/subjects/create', {
    title: 'Add Subject',
    layout: 'layouts/portal',
    roleLabel: 'Admin Portal',
    sidebarActive: 'subjects',
    success: req.flash('success'),
    error: req.flash('error'),
    formData: {},
    errors: {},
  });
};

// STORE NEW SUBJECT
exports.store = async (req, res) => {
  const { name, code, level } = req.body;

  const errors = {};
  if (!name || name.trim().length < 2) errors.name = 'Subject name is required.';
  if (!code || code.trim().length < 2) errors.code = 'Subject code is required.';
  if (!level || !['nursery','kg','lower_primary','upper_primary','jhs'].includes(level)) {
    errors.level = 'Please select a valid level.';
  }

  if (!errors.code) {
    const existing = await prisma.subject.findFirst({ where: { code: code.trim().toUpperCase() } });
    if (existing) errors.code = 'This code is already used.';
  }

  if (Object.keys(errors).length > 0) {
    return res.render('admin/subjects/create', {
      title: 'Add Subject',
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'subjects',
      success: [],
      error: ['Please fix the errors below.'],
      formData: req.body,
      errors,
    });
  }

  try {
    const subject = await prisma.subject.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        level,
      },
    });

    req.flash('success', 'Subject "' + subject.name + '" added.');
    res.redirect('/admin/subjects');
  } catch (err) {
    console.error('Subject store error:', err);
    req.flash('error', 'Failed to save subject: ' + err.message);
    res.redirect('/admin/subjects/create');
  }
};

// SHOW EDIT FORM
exports.edit = async (req, res) => {
  try {
    const subject = await prisma.subject.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!subject) {
      req.flash('error', 'Subject not found.');
      return res.redirect('/admin/subjects');
    }

    res.render('admin/subjects/edit', {
      title: 'Edit ' + subject.name,
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'subjects',
      success: req.flash('success'),
      error: req.flash('error'),
      subject,
      errors: {},
    });
  } catch (err) {
    console.error('Subject edit error:', err);
    req.flash('error', 'Failed to load subject.');
    res.redirect('/admin/subjects');
  }
};

// UPDATE SUBJECT
exports.update = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, code, level } = req.body;

  const errors = {};
  if (!name || name.trim().length < 2) errors.name = 'Name required.';
  if (!code || code.trim().length < 2) errors.code = 'Code required.';
  if (!level) errors.level = 'Level required.';

  if (!errors.code) {
    const dup = await prisma.subject.findFirst({
      where: { code: code.trim().toUpperCase(), id: { not: id } },
    });
    if (dup) errors.code = 'Another subject uses this code.';
  }

  if (Object.keys(errors).length > 0) {
    const subject = await prisma.subject.findUnique({ where: { id } });
    return res.render('admin/subjects/edit', {
      title: 'Edit Subject',
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'subjects',
      success: [],
      error: ['Please fix the errors below.'],
      subject: Object.assign({}, subject, req.body),
      errors,
    });
  }

  try {
    const subject = await prisma.subject.update({
      where: { id },
      data: { name: name.trim(), code: code.trim().toUpperCase(), level },
    });

    req.flash('success', 'Subject updated: ' + subject.name);
    res.redirect('/admin/subjects');
  } catch (err) {
    console.error('Subject update error:', err);
    req.flash('error', 'Failed to update subject.');
    res.redirect('/admin/subjects/' + id + '/edit');
  }
};

// DELETE SUBJECT
exports.destroy = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Check if subject is used in exams
    const examCount = await prisma.examination.count({ where: { subjectId: id } });
    if (examCount > 0) {
      req.flash('error', 'Cannot delete subject used in ' + examCount + ' exam(s).');
      return res.redirect('/admin/subjects');
    }

    const subject = await prisma.subject.findUnique({ where: { id } });
    await prisma.subject.delete({ where: { id } });

    req.flash('success', 'Subject removed: ' + (subject ? subject.name : ''));
    res.redirect('/admin/subjects');
  } catch (err) {
    console.error('Subject delete error:', err);
    req.flash('error', 'Failed to remove subject.');
    res.redirect('/admin/subjects');
  }
};
