const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('');
  console.log('🌱 Seeding database...');
  console.log('');

  // ═════════════════════════════════════════════════════
  // SUPER ADMIN — the first user of the system
  // ═════════════════════════════════════════════════════
  const adminEmail = 'admin@braininternationalschool.edu.gh';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existingAdmin) {
    console.log('ℹ️  Super Admin already exists — skipping.');
  } else {
    const hashedPassword = await bcrypt.hash('ChangeThis2026!', 10);

    const admin = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'super-admin',
        isActive: true,
      },
    });

    console.log('✅ Super Admin created');
    console.log('   ID:       ' + admin.id);
    console.log('   Email:    ' + adminEmail);
    console.log('   Password: ChangeThis2026!');
    console.log('   Role:     super-admin');
    console.log('');
    console.log('⚠️  Change this password immediately after first login!');
  }

  console.log('');
  console.log('🎉 Seeding complete!');
  console.log('');
}

main()
  .catch((e) => {
    console.error('');
    console.error('❌ Seeding failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
