import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import * as path from 'path';

// Load .env file for DATABASE_URL
import { config } from 'dotenv';
config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  // Ensure roles/permissions exist
  await import('./seed');

  const timestamp = Date.now();
  const adminEmail = `admin-${timestamp}@amg.local`;
  const adminPassword = 'AdminPass123';
  const userEmail = `user-${timestamp}@amg.local`;
  const userPassword = 'UserPass123';

  const superAdminRole = await prisma.role.findUnique({ where: { slug: 'super_admin' } });
  const userRole = await prisma.role.findUnique({ where: { slug: 'user' } });

  if (!superAdminRole || !userRole) {
    throw new Error('Required roles not found. Run prisma seed first.');
  }

  const adminPasswordHash = await hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Test Admin',
      email: adminEmail,
      password: adminPasswordHash,
      emailVerified: true,
      status: 'ACTIVE',
      roleId: superAdminRole.id,
      phone: '+201111111111',
      specialty: 'Admin',
      city: 'Cairo',
    },
  });

  const userPasswordHash = await hash(userPassword, 12);
  await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      name: 'Test User',
      email: userEmail,
      password: userPasswordHash,
      emailVerified: true,
      status: 'ACTIVE',
      roleId: userRole.id,
      phone: '+202222222222',
      specialty: 'Orthodontics',
      city: 'Alexandria',
    },
  });

  console.log(
    JSON.stringify({ adminEmail, adminPassword, userEmail, userPassword }),
  );
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
