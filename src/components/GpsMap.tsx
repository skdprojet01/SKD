import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface GpsMapProps {
  lat: number;
  lng: number;
  onCoordinateChange: (lat: number, lng: number) => void;
  routePoints?: Array<[number, number]>;
}

export function GpsMap({ lat, lng, onCoordinateChange, routePoints = [] }: GpsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Use OpenStreetMap Open-Source tiles
    const map = L.map(containerRef.current, {
      zoomControl: false,
    }).setView([lat, lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add scale and custom zoom control on top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Custom pulsing SVG marker
    const pulseIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-12 h-12 bg-indigo-500/30 rounded-full animate-ping"></div>
          <div class="relative w-8 h-8 bg-indigo-600 border-4 border-white rounded-full flex items-center justify-center shadow-xl">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
        </div>
      `,
      className: 'custom-gps-pin',
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    const marker = L.marker([lat, lng], {
      icon: pulseIcon,
      draggable: true,
    }).addTo(map);

    // Handle marker drag
    marker.on('drag', (e) => {
      const position = e.target.getLatLng();
      onCoordinateChange(position.lat, position.lng);
    });

    marker.on('dragend', (e) => {
      const position = e.target.getLatLng();
      onCoordinateChange(position.lat, position.lng);
    });

    // Handle clicking anywhere on map to reposition GPS
    map.on('click', (e) => {
      onCoordinateChange(e.latlng.lat, e.latlng.lng);
    });

    // Drawing polyline for history/route simulator
    const polyline = L.polyline(routePoints, {
      color: '#6366f1',
      weight: 4,
      dashArray: '5, 10',
      opacity: 0.8,
    }).addTo(map);

    mapRef.current = map;
    markerRef.current = marker;
    polylineRef.current = polyline;

    // Reacting to size changes smoothly (ResizeObserver)
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      polylineRef.current = null;
    };
  }, []);

  // Sync state when lat/lng variables change externally
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    const currentLatLng = markerRef.current.getLatLng();
    if (currentLatLng.lat !== lat || currentLatLng.lng !== lng) {
      markerRef.current.setLatLng([lat, lng]);
      
      // Pan to new coordinates if map is far away
      const center = mapRef.current.getCenter();
      const distance = Math.sqrt(Math.pow(center.lat - lat, 2) + Math.pow(center.lng - lng, 2));
      if (distance > 0.005) {
        mapRef.current.panTo([lat, lng]);
      }
    }
  }, [lat, lng]);

  // Sync polyline route trace
  useEffect(() => {
    if (!polylineRef.current) return;
    polylineRef.current.setLatLngs(routePoints);
  }, [routePoints]);

  return (
    <div className="relative w-full h-full min-h-[350px] md:min-h-[450px] rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      <div ref={containerRef} className="w-full h-full absolute inset-0 z-10" id="gps-leaflet-map" />
      {/* HUD Indicator */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md text-white rounded-lg px-3 py-1.5 text-xs font-mono flex items-center gap-2 border border-slate-700 shadow-md">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Map HUD: Active Live Simulator</span>
      </div>
    </div>
  );
}
