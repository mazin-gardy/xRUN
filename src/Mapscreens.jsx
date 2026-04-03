import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapScreen() {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      accessToken: 'pk.eyJ1IjoibWF6aW5nYXJkeSIsImEiOiJjbW42Mm9xdm4wMWZmMnJwbWViemxnMm80In0.SemO-naRR1E4uOsOJMQaVQ',
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [144.9631, -37.8136],
      zoom: 13,
    });

    return () => map.remove();
  }, []);

  return (
    <div
      ref={mapContainerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    />
  );
}