import MapScreen from './Mapscreens';
import CreateSessionButton from './component/FloatingButton';
import BottomNav from './component/bottomNav';
export default function App() {
  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
    }}>
      <MapScreen />
      <BottomNav />
      <CreateSessionButton onPress={() => alert('Select a activity: Running, cycling?')} />
    </div>
  );
}