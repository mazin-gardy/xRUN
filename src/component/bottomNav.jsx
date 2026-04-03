export default function BottomNav() {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      backgroundColor: '#0f0f0f',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '12px 0 24px',
    }}>

      {/* Profile */}
      <button style={navBtn}>
        <span style={navIcon}>👤</span>
        <span style={navLabel}>Profile</span>
      </button>

      {/* Community */}
      <button style={navBtn}>
        <span style={navIcon}>👥</span>
        <span style={navLabel}>Community</span>
      </button>

      {/* Empty space for centre + button */}
      <div style={{ flex: 1 }} />

      {/* Fitness Track */}
      <button style={navBtn}>
        <span style={navIcon}>📊</span>
        <span style={navLabel}>Fitness Track</span>
      </button>

      {/* Map */}
      <button style={navBtn}>
        <span style={navIcon}>🗺️</span>
        <span style={navLabel}>setting</span>
      </button>

    </div>
  );
}

const navBtn = {
  background: 'none',
  border: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
  cursor: 'pointer',
  flex: 1,
  padding: '0 8px',
};

const navIcon = {
  fontSize: '22px',
};

const navLabel = {
  fontSize: '9px',
  color: '#aaa',
  letterSpacing: '0.5px',
};