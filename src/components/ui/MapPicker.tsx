'use client';

import { useEffect, useRef, useState } from 'react';
import { IconMapPin, IconCrosshair } from '@tabler/icons-react';

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  defaultLat?: number;
  defaultLng?: number;
}

export default function MapPicker({ onLocationSelect, defaultLat = -6.2088, defaultLng = 106.8456 }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [leaflet, setLeaflet] = useState<typeof import('leaflet') | null>(null);
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const markerRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const L = await import('leaflet');
      setLeaflet(L);
    })();
  }, []);

  useEffect(() => {
    if (!leaflet || !mapRef.current || mapInstanceRef.current) return;

    const map = leaflet.map(mapRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 13,
      scrollWheelZoom: true,
    });

    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const marker = leaflet.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);
    markerRef.current = marker;

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      reverseGeocode(pos.lat, pos.lng);
    });

    map.on('click', (e: any) => {
      marker.setLatLng(e.latlng);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [leaflet, defaultLat, defaultLng]);

  async function reverseGeocode(lat: number, lng: number) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=id`,
        { headers: { 'User-Agent': 'pi-opung/1.0' } }
      );
      const data = await res.json();
      const displayName = data.display_name || `${lat}, ${lng}`;
      setAddress(displayName);
      onLocationSelect(lat, lng, displayName);
    } catch {
      const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddress(fallback);
      onLocationSelect(lat, lng, fallback);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim() || !leaflet) return;
    setIsSearching(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&accept-language=id`,
        { headers: { 'User-Agent': 'pi-opung/1.0' } }
      );
      const results = await res.json();

      if (results.length > 0 && mapInstanceRef.current && markerRef.current) {
        const { lat, lon, display_name } = results[0];
        mapInstanceRef.current.setView([lat, lon], 15);
        markerRef.current.setLatLng([lat, lon]);
        setAddress(display_name);
        onLocationSelect(Number(lat), Number(lon), display_name);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  }

  function handleGetCurrentLocation() {
    if (!navigator.geolocation || !leaflet || !mapInstanceRef.current || !markerRef.current) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapInstanceRef.current.setView([latitude, longitude], 15);
        markerRef.current.setLatLng([latitude, longitude]);
        reverseGeocode(latitude, longitude);
      },
      (err) => console.error('Geolocation error:', err)
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari lokasi..."
            className="flex-1 py-2 px-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {isSearching ? '...' : 'Cari'}
          </button>
        </form>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
          title="Pakai lokasi saya"
        >
          <IconCrosshair size={20} className="text-foreground/60" />
        </button>
      </div>

      <div ref={mapRef} className="w-full h-64 rounded-xl border border-border z-0" />

      {address && (
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <IconMapPin size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/80">{address}</p>
        </div>
      )}
    </div>
  );
}
