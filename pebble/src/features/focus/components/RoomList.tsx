import { OTHER_ROOMS, type RoomInfo } from '../data/rooms';

export default function RoomList({ onJoin }: { onJoin: (room: RoomInfo) => void }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', marginBottom: 12 }}>
        other rooms
      </div>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
        {OTHER_ROOMS.map((room) => (
          <button key={room.name} className="glass-card study-room-card" onClick={() => onJoin(room)}>
            <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
              {room.name}
            </div>
            <div aria-hidden="true" style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
              {room.colors.map((c, i) => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {room.people} {room.people === 1 ? 'person' : 'people'}
              </span>
              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(143,175,138,0.15)', color: 'var(--accent-sage)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                Active
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
