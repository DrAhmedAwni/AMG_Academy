import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const seededAdmin = {
  email: 'admin@amgacademy.local',
  password: 'AdminPass123',
  name: 'AMG Admin',
};

const roles = [
  {
    slug: 'super_admin',
    name: 'Super Admin',
    description: 'Full platform access',
  },
  {
    slug: 'amg_admin',
    name: 'AMG Admin',
    description: 'Administrative access for AMG Academy staff',
  },
  {
    slug: 'scanner',
    name: 'Scanner Staff',
    description: 'Attendance scanning access',
  },
  {
    slug: 'instructor',
    name: 'Instructor',
    description: 'Course management access for assigned courses',
  },
  {
    slug: 'user',
    name: 'User',
    description: 'Standard attendee and student account',
  },
];

const permissionMatrix = {
  super_admin: ['*:*'],
  amg_admin: [
    'users:read',
    'users:update',
    'users:delete',
    'roles:create',
    'roles:read',
    'roles:update',
    'roles:delete',
    'events:create',
    'events:read',
    'events:update',
    'events:delete',
    'registrations:read',
    'registrations:update',
    'registrations:approve',
    'registrations:reject',
    'payments:read',
    'payments:update',
    'attendance:read',
    'scanner:use',
    'qr-tickets:read',
    'qr-tickets:update',
    'announcements:create',
    'announcements:read',
    'announcements:update',
    'announcements:delete',
    'courses:create',
    'courses:read',
    'courses:update',
    'courses:delete',
    'reports:read',
    'exports:create',
    'audit_logs:read',
    'content_pages:create',
    'content_pages:read',
    'content_pages:update',
    'content_pages:delete',
    'certificates:read',
    'certificates:update',
    'certificates:approve',
  ],
  scanner: ['attendance:read', 'scanner:use'],
  instructor: ['courses:read', 'courses:update', 'lessons:create', 'lessons:update'],
  user: ['events:read', 'courses:read', 'registrations:create', 'enrollments:create'],
} as const;

async function main() {
  const permissionSet = new Set<string>();
  Object.values(permissionMatrix).forEach((entries) => {
    entries.forEach((entry) => {
      if (entry !== '*:*') {
        permissionSet.add(entry);
      }
    });
  });

  const permissions = await Promise.all(
    [...permissionSet].map(async (entry) => {
      const parts = entry.split(':');
      const module = parts[0]!;
      const action = parts[1]!;
      return prisma.permission.upsert({
        where: {
          module_action: { module, action },
        },
        update: {
          description: `${action} access for ${module}`,
        },
        create: {
          module,
          action,
          description: `${action} access for ${module}`,
        },
      });
    }),
  );

  const permissionMap = new Map(permissions.map((permission) => [`${permission.module}:${permission.action}`, permission.id]));

  for (const role of roles) {
    const createdRole = await prisma.role.upsert({
      where: { slug: role.slug },
      update: {
        name: role.name,
        description: role.description,
      },
      create: role,
    });

    const entries = permissionMatrix[role.slug as keyof typeof permissionMatrix];
    if (entries.some((e) => e === '*:*')) {
      await Promise.all(
        permissions.map((permission) =>
          prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: createdRole.id,
                permissionId: permission.id,
              },
            },
            update: {},
            create: {
              roleId: createdRole.id,
              permissionId: permission.id,
            },
          }),
        ),
      );
      continue;
    }

    await Promise.all(
      entries.map((entry) =>
        prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: createdRole.id,
              permissionId: permissionMap.get(entry)!,
            },
          },
          update: {},
          create: {
            roleId: createdRole.id,
            permissionId: permissionMap.get(entry)!,
          },
        }),
      ),
    );
  }

  const superAdminRole = await prisma.role.findUnique({
    where: { slug: 'super_admin' },
  });

  if (!superAdminRole) {
    throw new Error('Super admin role was not created');
  }

  await prisma.user.upsert({
    where: { email: seededAdmin.email },
    update: {
      name: seededAdmin.name,
      password: await hash(seededAdmin.password, 12),
      roleId: superAdminRole.id,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      status: 'ACTIVE',
    },
    create: {
      name: seededAdmin.name,
      email: seededAdmin.email,
      password: await hash(seededAdmin.password, 12),
      roleId: superAdminRole.id,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      status: 'ACTIVE',
    },
  });

  console.log(`Seeded admin user: ${seededAdmin.email} / ${seededAdmin.password}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
