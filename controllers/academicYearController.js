const prisma = require('../lib/prisma');

// LIST YEARS
exports.index = async (req, res) => {
  try {
    const years = await prisma.academicYear.findMany({
      include: { terms: { orderBy: { startDate: 'asc' } } },
      orderBy: { name: 'desc' },
    });

    res.render('admin/academic-years/index', {
      title: 'Academic Years',
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'academic-years',
      success: req.flash('success'),
      error: req.flash('error'),
      years,
    });
  } catch (err) {
    console.error('Years index error:', err);
    req.flash('error', 'Failed to load academic years.');
    res.redirect('/admin/dashboard');
  }
};

// SHOW CREATE FORM
exports.create = async (req, res) => {
  res.render('admin/academic-years/create', {
    title: 'Add Academic Year',
    layout: 'layouts/portal',
    roleLabel: 'Admin Portal',
    sidebarActive: 'academic-years',
    success: req.flash('success'),
    error: req.flash('error'),
    formData: {},
    errors: {},
  });
};

// STORE NEW YEAR
exports.store = async (req, res) => {
  const { name, startDate, endDate, firstTermStart, firstTermEnd, secondTermStart, secondTermEnd, thirdTermStart, thirdTermEnd } = req.body;

  const errors = {};
  if (!name || name.trim().length < 4) errors.name = 'Academic year name is required (e.g., 2025/2026).';
  if (!startDate) errors.startDate = 'Start date is required.';
  if (!endDate) errors.endDate = 'End date is required.';

  if (!errors.name) {
    const existing = await prisma.academicYear.findFirst({ where: { name: name.trim() } });
    if (existing) errors.name = 'This academic year already exists.';
  }

  if (Object.keys(errors).length > 0) {
    return res.render('admin/academic-years/create', {
      title: 'Add Academic Year',
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'academic-years',
      success: [],
      error: ['Please fix the errors below.'],
      formData: req.body,
      errors,
    });
  }

  try {
    const year = await prisma.academicYear.create({
      data: {
        name: name.trim(),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isCurrent: false,
      },
    });

    // Create terms if dates were provided
    const terms = [];
    if (firstTermStart && firstTermEnd) {
      terms.push({ name: 'First Term', startDate: new Date(firstTermStart), endDate: new Date(firstTermEnd), isCurrent: false });
    }
    if (secondTermStart && secondTermEnd) {
      terms.push({ name: 'Second Term', startDate: new Date(secondTermStart), endDate: new Date(secondTermEnd), isCurrent: false });
    }
    if (thirdTermStart && thirdTermEnd) {
      terms.push({ name: 'Third Term', startDate: new Date(thirdTermStart), endDate: new Date(thirdTermEnd), isCurrent: false });
    }

    for (const t of terms) {
      await prisma.term.create({
        data: { academicYearId: year.id, ...t },
      });
    }

    req.flash('success', 'Academic year ' + year.name + ' created with ' + terms.length + ' term(s).');
    res.redirect('/admin/academic-years');
  } catch (err) {
    console.error('Year store error:', err);
    req.flash('error', 'Failed to save year: ' + err.message);
    res.redirect('/admin/academic-years/create');
  }
};

// SET AS CURRENT
exports.setCurrent = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // Unset all others
    await prisma.academicYear.updateMany({ data: { isCurrent: false } });
    await prisma.academicYear.update({ where: { id }, data: { isCurrent: true } });

    req.flash('success', 'Academic year set as current.');
    res.redirect('/admin/academic-years');
  } catch (err) {
    console.error('Set current year error:', err);
    req.flash('error', 'Failed to set current year.');
    res.redirect('/admin/academic-years');
  }
};

// SET TERM AS CURRENT
exports.setCurrentTerm = async (req, res) => {
  try {
    const termId = parseInt(req.params.termId);
    // Unset all other current terms
    await prisma.term.updateMany({ data: { isCurrent: false } });
    await prisma.term.update({ where: { id: termId }, data: { isCurrent: true } });

    req.flash('success', 'Term set as current.');
    res.redirect('/admin/academic-years');
  } catch (err) {
    console.error('Set current term error:', err);
    req.flash('error', 'Failed to set current term.');
    res.redirect('/admin/academic-years');
  }
};

// DELETE YEAR
exports.destroy = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const year = await prisma.academicYear.findUnique({ where: { id } });

    if (year && year.isCurrent) {
      req.flash('error', 'Cannot delete the current academic year.');
      return res.redirect('/admin/academic-years');
    }

    await prisma.academicYear.delete({ where: { id } });
    req.flash('success', 'Academic year removed.');
    res.redirect('/admin/academic-years');
  } catch (err) {
    console.error('Year delete error:', err);
    req.flash('error', 'Failed to delete year. It may have linked records.');
    res.redirect('/admin/academic-years');
  }
};
