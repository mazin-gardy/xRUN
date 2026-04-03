export default function CreateSessionButton({ onPress }) {
  return (
    <button
      onClick={onPress}
      style={{
        position: 'fixed',
        bottom: '90px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        width: '70px',
        height: '70px',
        borderRadius: '50%',
        border: 'none',
        backgroundColor: '#000000',
        color: '#ffffff',
        fontSize: '32px',
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(234,179,8,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '300',
      }}
    >
      +
    </button>
  );
}