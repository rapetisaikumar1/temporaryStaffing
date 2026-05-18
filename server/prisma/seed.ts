import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin
  const superAdminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@niyukti.com';
  const superAdminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123';

  const existing = await prisma.user.findUnique({ where: { email: superAdminEmail } });

  if (!existing) {
    const hashed = await bcrypt.hash(superAdminPassword, 10);
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: superAdminEmail,
        password: hashed,
        role: Role.ADMIN,
        isActive: true,
      },
    });
    console.log(`✅ Super Admin created: ${superAdminEmail}`);
  } else {
    console.log(`ℹ️  Super Admin already exists: ${superAdminEmail}`);
  }

  // Admin user
  const adminEmail = 'admin@niyukti.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashed = await bcrypt.hash('Admin@123', 10);
    await prisma.user.create({
      data: {
        name: 'Admin User',
        email: adminEmail,
        password: hashed,
        role: Role.ADMIN,
        isActive: true,
      },
    });
    console.log(`✅ Admin created: ${adminEmail}`);
  } else {
    console.log(`ℹ️  Admin already exists: ${adminEmail}`);
  }

  console.log('✅ Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
