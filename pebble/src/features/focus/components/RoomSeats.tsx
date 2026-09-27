import type { RoomUser } from '../data/rooms';
import { seatPosition } from '../lib/timer';

/** Everyone in the room on a circle; a green dot means they're focusing. */
export default function RoomSeats({ users, noMotion }: { users: RoomUser[]; noMotion: boolean }) {
  return users.map((user, i) => {
    const { x, y } = seatPosition(i, users.length);
    const you = user.name === 'You';
    return (
      <div key={user.name} style={{ position: 'absolute', left: x, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: user.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: user.focusing && !noMotion ? `0 0 12px color-mix(in srgb, ${user.color} 40%, transparent)` : 'none',
          border: you ? '2px solid var(--accent-lavender)' : '2px solid transparent',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', width: 4, height: 4, background: '#2A2A2E', borderRadius: '50%', top: 12, left: 9 }} />
          <div style={{ position: 'absolute', width: 4, height: 4, background: '#2A2A2E', borderRadius: '50%', top: 12, right: 9 }} />
          {user.focusing && (
            <div style={{
              position: 'absolute', bottom: -2, right: -2,
              width: 10, height: 10, borderRadius: '50%',
              background: 'var(--accent-sage)', border: '2px solid var(--bg-deep)',
            }} />
          )}
        </div>
        <span style={{ fontSize: 10, color: you ? 'var(--accent-lavender)' : 'var(--text-muted)', fontFamily: 'var(--font-nunito)', fontWeight: you ? 700 : 400 }}>
          {user.name}
        </span>
      </div>
    );
  });
}
