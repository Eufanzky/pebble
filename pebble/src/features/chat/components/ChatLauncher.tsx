interface ChatLauncherProps {
  isOpen: boolean;
  noMotion: boolean;
  onToggle: () => void;
}

/** The floating Pebble face that opens and closes the chat. */
export default function ChatLauncher({ isOpen, noMotion, onToggle }: ChatLauncherProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={isOpen ? 'Close chat with Pebble' : 'Chat with Pebble'}
      style={{
        // Clear of the tab bar on phones (--app-bottom-inset, shell.css)
        position: 'fixed', bottom: 'calc(24px + var(--app-bottom-inset, 0px))', right: 24, zIndex: 50,
        width: 56, height: 56, borderRadius: '50%',
        background: 'var(--pebble-color)', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        transition: noMotion ? 'none' : 'transform 0.2s ease',
        transform: isOpen ? 'scale(0.9)' : 'scale(1)',
      }}
    >
      {/* Pebble face */}
      <div style={{ position: 'relative', width: 28, height: 28 }}>
        <div style={{ position: 'absolute', width: 6, height: 6, background: '#2A2A2E', borderRadius: '50%', top: 8, left: 4 }} />
        <div style={{ position: 'absolute', width: 6, height: 6, background: '#2A2A2E', borderRadius: '50%', top: 8, right: 4 }} />
        <div style={{ position: 'absolute', width: 2, height: 2, background: 'white', borderRadius: '50%', top: 7, left: 5.5, opacity: 0.8 }} />
        <div style={{ position: 'absolute', width: 2, height: 2, background: 'white', borderRadius: '50%', top: 7, right: 5.5, opacity: 0.8 }} />
        {!isOpen && (
          <div data-part="mouth" style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 8, height: 4, borderRadius: '0 0 4px 4px', background: '#2A2A2E' }} />
        )}
      </div>
    </button>
  );
}
