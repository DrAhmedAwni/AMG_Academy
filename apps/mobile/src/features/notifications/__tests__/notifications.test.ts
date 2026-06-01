import { normalizeNotification } from '../notifications.api';

describe('notification read-state logic', () => {
  it('normalizes a notification without changes', () => {
    const raw = {
      id: 'notif-1',
      type: 'NewAnnouncement',
      title: 'Test Notification',
      message: 'This is a test.',
      read: false,
      entityType: 'Event',
      entityId: 'evt-1',
      createdAt: '2026-01-01T00:00:00Z',
    };

    expect(normalizeNotification(raw)).toEqual(raw);
  });

  it('preserves read state', () => {
    const unread = {
      id: 'notif-1',
      type: 'generic',
      title: 'Unread',
      message: 'Unread message',
      read: false,
      entityType: null,
      entityId: null,
      createdAt: '2026-01-01T00:00:00Z',
    };
    const read = { ...unread, id: 'notif-2', read: true };

    expect(normalizeNotification(unread).read).toBe(false);
    expect(normalizeNotification(read).read).toBe(true);
  });

  it('handles different notification types', () => {
    const announcement = {
      id: 'n-1',
      type: 'NewAnnouncement',
      title: 'Announcement',
      message: 'New announcement',
      read: false,
      entityType: 'Announcement',
      entityId: 'ann-1',
      createdAt: '2026-01-01T00:00:00Z',
    };

    const generic = {
      id: 'n-2',
      type: 'generic',
      title: 'Generic',
      message: 'Generic notification',
      read: true,
      entityType: null,
      entityId: null,
      createdAt: '2026-01-02T00:00:00Z',
    };

    expect(normalizeNotification(announcement).type).toBe('NewAnnouncement');
    expect(normalizeNotification(generic).type).toBe('generic');
  });
});
