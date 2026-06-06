import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
(async () => {
  const devices = await p.pushDevice.findMany();
  console.log('Push devices:', JSON.stringify(devices.map(d => ({id:d.id, userId:d.userId, token: d.expoPushToken.substring(0,30)+'...', enabled:d.enabled})), null, 2));
  const users = await p.user.findMany({ where: { status: 'ACTIVE' }, select: { id: true, email: true } });
  console.log('Active users:', users.length);
  const anns = await p.announcement.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
  console.log('Recent announcements:', JSON.stringify(anns.map(a => ({id:a.id, title:a.title, status:a.status})), null, 2));
  const notifs = await p.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
  console.log('Recent notifications:', JSON.stringify(notifs.map(n => ({id:n.id, userId:n.userId, type:n.type, title:n.title})), null, 2));
  await p.$disconnect();
})();
