import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export default function MapScreen({ onCreateSession }) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);
  const [routePoints, setRoutePoints] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const markersRef = useRef([]);

  useEffect(() => {
    mapboxgl.accessToken = accessToken;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [144.9631, -37.8136],
      zoom: 13,
    });

    // Add route layer when map loads
    mapRef.current.on('load', () => {
      mapRef.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [],
          },
        },
      });

      mapRef.current.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#eab308',
          'line-width': 4,
          'line-dasharray': [2, 1],
        },
      });
    });

    return () => mapRef.current?.remove();
  }, []);

  // Calculate distance between two coordinates in km
  const calculateDistance = (coord1, coord2) => {
    const R = 6371;
    const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
    const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coord1[1] * Math.PI / 180) *
      Math.cos(coord2[1] * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calculate total route distance
  const calculateTotalDistance = (points) => {
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      total += calculateDistance(points[i - 1], points[i]);
    }
    return total;
  };

  // Handle map click when creating route
  useEffect(() => {
    if (!mapRef.current) return;

    const handleClick = (e) => {
      if (!isCreatingRoute) return;

      const newPoint = [e.lngLat.lng, e.lngLat.lat];

      setRoutePoints(prev => {
        const updated = [...prev, newPoint];

        // Update route line on map
        mapRef.current.getSource('route')?.setData({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: updated,
          },
        });

        // Calculate distance
        setTotalDistance(calculateTotalDistance(updated));

        // Add marker at clicked point
        const el = document.createElement('div');
        el.style.cssText = `
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #eab308;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          cursor: pointer;
        `;

        // First point is green
        if (updated.length === 1) {
          el.style.background = '#4ade80';
          el.style.width = '20px';
          el.style.height = '20px';
        }

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat(newPoint)
          .addTo(mapRef.current);

        markersRef.current.push(marker);

        return updated;
      });
    };

    mapRef.current.on('click', handleClick);

    // Change cursor when creating route
    if (isCreatingRoute) {
      mapRef.current.getCanvas().style.cursor = 'crosshair';
    } else {
      mapRef.current.getCanvas().style.cursor = '';
    }

    return () => {
      mapRef.current?.off('click', handleClick);
    };
  }, [isCreatingRoute]);

  const handleStartRoute = () => {
    setIsCreatingRoute(true);
    setRoutePoints([]);
    setTotalDistance(0);

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Clear route line
    mapRef.current.getSource('route')?.setData({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: [] },
    });
  };

  const handleUndoLastPoint = () => {
    setRoutePoints(prev => {
      if (prev.length === 0) return prev;
      const updated = prev.slice(0, -1);

      // Remove last marker
      const lastMarker = markersRef.current.pop();
      lastMarker?.remove();

      // Update route line
      mapRef.current.getSource('route')?.setData({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: updated },
      });

      setTotalDistance(calculateTotalDistance(updated));
      return updated;
    });
  };

  const handleCancelRoute = () => {
    setIsCreatingRoute(false);
    setRoutePoints([]);
    setTotalDistance(0);

    // Clear markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Clear route line
    mapRef.current.getSource('route')?.setData({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: [] },
    });

    mapRef.current.getCanvas().style.cursor = '';
  };

  const handleSaveRoute = () => {
    if (routePoints.length < 2) {
      alert('Add at least 2 points to create a route');
      return;
    }

    const routeName = prompt('Name your route:');
    if (!routeName) return;

    alert(`Route "${routeName}" saved!\nDistance: ${totalDistance.toFixed(2)}km\nPoints: ${routePoints.length}`);

    // Here you will save to Supabase later
    handleCancelRoute();
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>

      {/* Map */}
      <div
        ref={mapContainerRef}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Route creation mode banner */}
      {isCreatingRoute && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          backgroundColor: 'rgba(0,0,0,0.9)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: 25,
          border: '1px solid #eab308',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ fontSize: 13, fontWeight: 'bold', color: '#eab308', marginBottom: 4 }}>
            📍 TAP MAP TO ADD ROUTE POINTS
          </div>
          <div style={{ fontSize: 12, color: '#aaa' }}>
            {routePoints.length} points · {totalDistance.toFixed(2)} km
          </div>
        </div>
      )}

      {/* Route creation controls */}
      {isCreatingRoute && (
        <div style={{
          position: 'absolute',
          bottom: 100,
          left: 16,
          right: 16,
          zIndex: 100,
          backgroundColor: 'rgba(0,0,0,0.92)',
          borderRadius: 16,
          padding: 16,
          border: '1px solid rgba(255,255,255,0.1)',
        }}>

          {/* Distance display */}
          <div style={{
            textAlign: 'center',
            marginBottom: 14,
          }}>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#eab308' }}>
              {totalDistance.toFixed(2)} km
            </div>
            <div style={{ fontSize: 11, color: '#666' }}>
              {routePoints.length} points added · tap map to continue
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleUndoLastPoint}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.15)',
                backgroundColor: 'transparent',
                color: '#aaa',
                fontSize: 13,
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              ↩ UNDO
            </button>

            <button
              onClick={handleCancelRoute}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 12,
                border: '1px solid rgba(239,68,68,0.4)',
                backgroundColor: 'rgba(239,68,68,0.1)',
                color: '#ef4444',
                fontSize: 13,
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              ✕ CANCEL
            </button>

            <button
              onClick={handleSaveRoute}
              disabled={routePoints.length < 2}
              style={{
                flex: 2,
                padding: '12px',
                borderRadius: 12,
                border: 'none',
                backgroundColor: routePoints.length < 2 ? '#333' : '#eab308',
                color: routePoints.length < 2 ? '#666' : '#000',
                fontSize: 13,
                fontWeight: 'bold',
                cursor: routePoints.length < 2 ? 'not-allowed' : 'pointer',
              }}
            >
              ✓ SAVE ROUTE
            </button>
          </div>
        </div>
      )}

      {/* Main + button */}
      {!isCreatingRoute && (
        <button
          onClick={handleStartRoute}
          style={{
            position: 'absolute',
            bottom: 90,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            width: 70,
            height: 70,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#111',
            color: '#fff',
            fontSize: 32,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          +
        </button>
      )}

    </div>
  );
}