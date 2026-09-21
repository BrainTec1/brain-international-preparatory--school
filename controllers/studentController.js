const prisma = require('../lib/prisma');

// LIST ALL STUDENTS
exports.index = async (req, res) => {
  try {
    const { search, classId, status } = req.query;
    const where = { deletedAt: null };

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName:  { contains: search } },
        { studentId: { contains: search } },
      ];
    }
    if (classId) where.classId = parseInt(classId);
    if (status)  where.status = status;

    const [students, classes] = await Promise.all([
      prisma.student.findMany({
        where,
        include: { class: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.schoolClass.findMany({ orderBy: { name: 'asc' } }),
    ]);

    res.render('admin/students/index', {
      title: 'Students',
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'students',
      success: req.flash('success'),
      error: req.flash('error'),
      students,
      classes,
      filters: { search: search || '', classId: classId || '', status: status || '' },
      counts: {
        total: students.length,
        active: students.filter(s => s.status === 'active').length,
      },
    });
  } catch (err) {
    console.error('Students index error:', err);
    req.flash('error', 'Failed to load students.');
    res.redirect('/admin/dashboard');
  }
};

// SHOW CREATE FORM
exports.create = async (req, res) => {
  try {
    const classes = await prisma.schoolClass.findMany({ orderBy: { name: 'asc' } });
    res.render('admin/students/create', {
      title: 'Add Student',
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'students',
      success: req.flash('success'),
      error: req.flash('error'),
      classes,
      formData: {},
      errors: {},
    });
  } catch (err) {
    console.error('Student create form error:', err);
    req.flash('error', 'Failed to load form.');
    res.redirect('/admin/students');
  }
};

// STORE NEW STUDENT
exports.store = async (req, res) => {
  const { firstName, lastName, dateOfBirth, gender, classId, address, previousSchool, admissionDate, status } = req.body;

  const errors = {};
  if (!firstName || firstName.trim().length < 2) errors.firstName = 'First name is required (min 2 characters).';
  if (!lastName || lastName.trim().length < 2)   errors.lastName  = 'Last name is required (min 2 characters).';
  if (!dateOfBirth) errors.dateOfBirth = 'Date of birth is required.';
  if (!gender || !['male', 'female'].includes(gender)) errors.gender = 'Please select a gender.';
  if (!classId) errors.classId = 'Please select a class.';
  if (!admissionDate) errors.admissionDate = 'Admission date is required.';

  if (Object.keys(errors).length > 0) {
    const classes = await prisma.schoolClass.findMany({ orderBy: { name: 'asc' } });
    return res.render('admin/students/create', {
      title: 'Add Student',
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'students',
      success: [],
      error: ['Please fix the errors below.'],
      classes,
      formData: req.body,
      errors,
    });
  }

  try {
    const year = new Date().getFullYear();
    const count = await prisma.student.count({
      where: { studentId: { startsWith: 'BIS/' + year + '/' } },
    });
    const studentId = 'BIS/' + year + '/' + String(count + 1).padStart(4, '0');

    const currentYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });

    const student = await prisma.student.create({
      data: {
        studentId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: new Date(dateOfBirth),
        gender,
        classId: parseInt(classId),
        academicYearId: currentYear ? currentYear.id : null,
        address: address ? address.trim() : null,
        previousSchool: previousSchool ? previousSchool.trim() : null,
        admissionDate: new Date(admissionDate),
        status: status || 'active',
      },
    });

    req.flash('success', 'Student "' + student.firstName + ' ' + student.lastName + '" added. ID: ' + student.studentId);
    res.redirect('/admin/students');
  } catch (err) {
    console.error('Student store error:', err);
    req.flash('error', 'Failed to save student: ' + err.message);
    res.redirect('/admin/students/create');
  }
};

// SHOW ONE STUDENT
exports.show = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { class: true, parents: { include: { parent: true } } },
    });

    if (!student || student.deletedAt) {
      req.flash('error', 'Student not found.');
      return res.redirect('/admin/students');
    }

    res.render('admin/students/show', {
      title: student.firstName + ' ' + student.lastName,
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'students',
      success: req.flash('success'),
      error: req.flash('error'),
      student,
    });
  } catch (err) {
    console.error('Student show error:', err);
    req.flash('error', 'Failed to load student.');
    res.redirect('/admin/students');
  }
};

// SHOW EDIT FORM
exports.edit = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!student || student.deletedAt) {
      req.flash('error', 'Student not found.');
      return res.redirect('/admin/students');
    }

    const classes = await prisma.schoolClass.findMany({ orderBy: { name: 'asc' } });
    res.render('admin/students/edit', {
      title: 'Edit ' + student.firstName + ' ' + student.lastName,
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'students',
      success: req.flash('success'),
      error: req.flash('error'),
      student,
      classes,
      errors: {},
    });
  } catch (err) {
    console.error('Student edit error:', err);
    req.flash('error', 'Failed to load student.');
    res.redirect('/admin/students');
  }
};

// UPDATE STUDENT
exports.update = async (req, res) => {
  const id = parseInt(req.params.id);
  const { firstName, lastName, dateOfBirth, gender, classId, address, previousSchool, admissionDate, status } = req.body;

  const errors = {};
  if (!firstName || firstName.trim().length < 2) errors.firstName = 'First name required.';
  if (!lastName || lastName.trim().length < 2)   errors.lastName  = 'Last name required.';
  if (!dateOfBirth) errors.dateOfBirth = 'Date of birth required.';
  if (!gender) errors.gender = 'Gender required.';
  if (!classId) errors.classId = 'Class required.';

  if (Object.keys(errors).length > 0) {
    const student = await prisma.student.findUnique({ where: { id } });
    const classes = await prisma.schoolClass.findMany({ orderBy: { name: 'asc' } });
    return res.render('admin/students/edit', {
      title: 'Edit Student',
      layout: 'layouts/portal',
      roleLabel: 'Admin Portal',
      sidebarActive: 'students',
      success: [],
      error: ['Please fix the errors below.'],
      student: Object.assign({}, student, req.body),
      classes,
      errors,
    });
  }

  try {
    const student = await prisma.student.update({
      where: { id },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: new Date(dateOfBirth),
        gender,
        classId: parseInt(classId),
        address: address ? address.trim() : null,
        previousSchool: previousSchool ? previousSchool.trim() : null,
        admissionDate: new Date(admissionDate),
        status: status || 'active',
      },
    });

    req.flash('success', 'Student updated: ' + student.firstName + ' ' + student.lastName);
    res.redirect('/admin/students/' + id);
  } catch (err) {
    console.error('Student update error:', err);
    req.flash('error', 'Failed to update student.');
    res.redirect('/admin/students/' + id + '/edit');
  }
};

// ARCHIVE STUDENT
exports.destroy = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const student = await prisma.student.update({
      where: { id },
      data: { status: 'archived', deletedAt: new Date() },
    });

    req.flash('success', 'Student archived: ' + student.firstName + ' ' + student.lastName);
    res.redirect('/admin/students');
  } catch (err) {
    console.error('Student delete error:', err);
    req.flash('error', 'Failed to archive student.');
    res.redirect('/admin/students');
  }
};
