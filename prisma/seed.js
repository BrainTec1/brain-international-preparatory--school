const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('');
  console.log('🌱 Seeding database...');
  console.log('');

  // SUPER ADMIN
  const adminEmail = 'admin@braininternationalschool.edu.gh';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existingAdmin) {
    console.log('ℹ️  Super Admin already exists — skipping.');
  } else {
    const hashedPassword = await bcrypt.hash('ChangeThis2026!', 10);
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'super-admin',
        isActive: true,
      },
    });
    console.log('✅ Super Admin created');
  }

  // ACADEMIC YEAR
  let year = await prisma.academicYear.findFirst({ where: { name: '2025/2026' } });
  if (!year) {
    year = await prisma.academicYear.create({
      data: {
        name: '2025/2026',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-07-31'),
        isCurrent: true,
      },
    });
    console.log('✅ Academic year created');
  } else {
    console.log('ℹ️  Academic year exists — skipping.');
  }

  // TERMS
  const termsData = [
    { name: 'First Term',  startDate: '2025-09-01', endDate: '2025-12-20', isCurrent: true },
    { name: 'Second Term', startDate: '2026-01-10', endDate: '2026-04-05', isCurrent: false },
    { name: 'Third Term',  startDate: '2026-04-20', endDate: '2026-07-25', isCurrent: false },
  ];

  for (const t of termsData) {
    const existing = await prisma.term.findFirst({
      where: { academicYearId: year.id, name: t.name },
    });
    if (!existing) {
      await prisma.term.create({
        data: {
          academicYearId: year.id,
          name: t.name,
          startDate: new Date(t.startDate),
          endDate: new Date(t.endDate),
          isCurrent: t.isCurrent,
        },
      });
      console.log('✅ Term created: ' + t.name);
    }
  }

  // CLASSES
  const classesData = [
    { name: 'Nursery 1',  level: 'nursery' },
    { name: 'Nursery 2',  level: 'nursery' },
    { name: 'KG 1',       level: 'kg' },
    { name: 'KG 2',       level: 'kg' },
    { name: 'Primary 1',  level: 'lower_primary' },
    { name: 'Primary 2',  level: 'lower_primary' },
    { name: 'Primary 3',  level: 'lower_primary' },
    { name: 'Primary 4',  level: 'upper_primary' },
    { name: 'Primary 5',  level: 'upper_primary' },
    { name: 'Primary 6',  level: 'upper_primary' },
    { name: 'JHS 1',      level: 'jhs' },
    { name: 'JHS 2',      level: 'jhs' },
    { name: 'JHS 3',      level: 'jhs' },
  ];

  let cNew = 0;
  for (const c of classesData) {
    const existing = await prisma.schoolClass.findFirst({ where: { name: c.name } });
    if (!existing) {
      await prisma.schoolClass.create({ data: c });
      cNew++;
    }
  }
  console.log('✅ Classes: ' + cNew + ' new');

  // SUBJECTS
  const subjectsData = [
    { name: 'English Language',            code: 'ENG',  level: 'jhs' },
    { name: 'Mathematics',                 code: 'MATH', level: 'jhs' },
    { name: 'Integrated Science',          code: 'SCI',  level: 'jhs' },
    { name: 'Social Studies',              code: 'SOC',  level: 'jhs' },
    { name: 'Religious & Moral Education', code: 'RME',  level: 'jhs' },
    { name: 'Computing',                   code: 'ICT',  level: 'jhs' },
    { name: 'Ghanaian Language',           code: 'GHL',  level: 'jhs' },
    { name: 'French',                      code: 'FRE',  level: 'jhs' },
  ];

  let sNew = 0;
  for (const s of subjectsData) {
    const existing = await prisma.subject.findFirst({ where: { code: s.code } });
    if (!existing) {
      await prisma.subject.create({ data: s });
      sNew++;
    }
  }
  console.log('✅ Subjects: ' + sNew + ' new');

  console.log('');
  console.log('🎉 Seeding complete!');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });