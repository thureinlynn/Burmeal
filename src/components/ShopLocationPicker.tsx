import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, LocateFixed, RotateCcw, Search } from 'lucide-react';
import {
  buildOsmNominatimSearchUrl,
  formatCoordinateValue,
  getDefaultCenterForCountry,
  hasValidCoordinates,
  parseOsmNominatimResult,
} from '../utils/shopLocationHelpers';

interface ShopLocationPickerProps {
  latitude?: number;
  longitude?: number;
  country?: string;
  city?: string;
  shopName?: string;
  onChange: (lat: number | undefined, lng: number | undefined) => void;
}

function createShopPinIcon() {
  return L.divIcon({
    className: 'burmeal-osm-pin',
    html: `
      <div style="position:relative;width:30px;height:38px;display:flex;align-items:center;justify-content:center;">
        <svg viewBox="0 0 24 30" width="30" height="38" style="filter:drop-shadow(0 3px 6px rgba(0,0,0,0.35));overflow:visible;">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 8.5 12 18 12 18s12-9.5 12-18C24 5.37 18.63 0 12 0z" fill="#d97706" stroke="#ffffff" stroke-width="2"/>
          <circle cx="12" cy="11.5" r="4.2" fill="#ffffff"/>
        </svg>
      </div>
    `,
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -34],
  });
}

export const ShopLocationPicker: React.FC<ShopLocationPickerProps> = ({
  latitude,
  longitude,
  country,
  city,
  shopName,
  onChange,
}) => {
  const hasPin = hasValidCoordinates(latitude, longitude);
  const fallbackCenter = getDefaultCenterForCountry(country, city);
  const activeCenter = hasPin
    ? { lat: Number(latitude), lng: Number(longitude) }
    : fallbackCenter;

  const [geoStatus, setGeoStatus] = useState<string>('');
  const [isLocating, setIsLocating] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Initialize Leaflet + OpenStreetMap instance once
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapInstanceRef.current) return;

    const map = L.map(container, {
      center: [activeCenter.lat, activeCenter.lng],
      zoom: hasPin ? 15 : 12,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    map.on('click', (event: L.LeafletMouseEvent) => {
      const lat = formatCoordinateValue(event.latlng.lat);
      const lng = formatCoordinateValue(event.latlng.lng);
      setGeoStatus('');
      onChangeRef.current(lat, lng);
    });

    mapInstanceRef.current = map;

    const resizeTimer = window.setTimeout(() => {
      map.invalidateSize();
    }, 150);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(container);
    }

    return () => {
      window.clearTimeout(resizeTimer);
      if (resizeObserver) resizeObserver.disconnect();
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Keep Leaflet marker and map center synchronized with props
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (hasPin) {
      const lat = Number(latitude);
      const lng = Number(longitude);

      if (!markerRef.current) {
        const marker = L.marker([lat, lng], {
          draggable: true,
          icon: createShopPinIcon(),
          title: shopName || 'Shop Pick-Up Location',
        }).addTo(map);

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          setGeoStatus('');
          onChangeRef.current(
            formatCoordinateValue(pos.lat),
            formatCoordinateValue(pos.lng)
          );
        });

        markerRef.current = marker;
      } else {
        markerRef.current.setLatLng([lat, lng]);
        markerRef.current.options.title = shopName || 'Shop Pick-Up Location';
      }

      const currentCenter = map.getCenter();
      const distance = currentCenter.distanceTo(L.latLng(lat, lng));
      if (distance > 15 || map.getZoom() < 13) {
        map.setView([lat, lng], Math.max(map.getZoom(), 15), { animate: true });
      }
    } else {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      const nextDefault = getDefaultCenterForCountry(country, city);
      const currentCenter = map.getCenter();
      if (currentCenter.distanceTo(L.latLng(nextDefault.lat, nextDefault.lng)) > 500) {
        map.setView([nextDefault.lat, nextDefault.lng], 12, { animate: true });
      }
    }
  }, [hasPin, latitude, longitude, country, city, shopName]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Browser geolocation is unavailable on this device.');
      return;
    }
    setIsLocating(true);
    setGeoStatus('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = formatCoordinateValue(pos.coords.latitude);
        const lng = formatCoordinateValue(pos.coords.longitude);
        onChange(lat, lng);
        setGeoStatus('Pinned your current GPS location on OpenStreetMap.');
        setIsLocating(false);
      },
      (err) => {
        setGeoStatus(err.message || 'Could not read current location permission.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearchPlace = async () => {
    const searchUrl = buildOsmNominatimSearchUrl(searchText, country);
    if (!searchUrl) return;
    setIsSearching(true);
    setGeoStatus('');
    try {
      const res = await fetch(searchUrl, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        setGeoStatus('OpenStreetMap search is temporarily unavailable. Click the map directly to drop a pin.');
        return;
      }
      const data = await res.json();
      const match = parseOsmNominatimResult(data);
      if (!match) {
        setGeoStatus('No matching place found on OpenStreetMap. Try a nearby street or city name.');
        return;
      }
      onChange(match.lat, match.lng);
      setGeoStatus(`Pinned: ${match.displayName}`);
    } catch {
      setGeoStatus('Could not reach OpenStreetMap search. Click the map directly to drop a pin.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearPin = () => {
    setGeoStatus('');
    onChange(undefined, undefined);
  };

  return (
    <div className="space-y-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-850/60 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>Pick Shop Location (OpenStreetMap)</span>
          </h4>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
            Click anywhere on the map or drag the pin to set the exact pick-up spot for the storefront Direction button.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:border-amber-500 transition-colors cursor-pointer disabled:opacity-50"
          >
            <LocateFixed className="w-3.5 h-3.5 text-amber-600" />
            <span>{isLocating ? 'Locating...' : 'Use Current Location'}</span>
          </button>

          {hasPin && (
            <button
              type="button"
              onClick={handleClearPin}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Search OpenStreetMap without nesting a form inside ShopDashboard's form */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchPlace();
              }
            }}
            placeholder="Search street, landmark, or neighborhood on OpenStreetMap..."
            aria-label="Search OpenStreetMap location"
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
          />
        </div>
        <button
          type="button"
          onClick={handleSearchPlace}
          disabled={isSearching || !searchText.trim()}
          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isSearching ? 'Searching...' : 'Find'}
        </button>
      </div>

      {/* Explicit non-zero container height required by Leaflet */}
      <div
        ref={mapContainerRef}
        data-testid="osm-leaflet-map"
        className="w-full h-[320px] rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 relative z-0"
      />

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
        {hasPin ? (
          <span className="font-mono text-emerald-700 dark:text-emerald-400 font-medium">
            Pinned Coordinates: {Number(latitude).toFixed(5)}, {Number(longitude).toFixed(5)}
          </span>
        ) : (
          <span className="text-stone-500 dark:text-stone-400">
            Click on the OpenStreetMap canvas above to drop your shop location pin.
          </span>
        )}
        <span className="text-[10px] text-stone-400 dark:text-stone-500">
          Powered by OpenStreetMap &bull; Leaflet
        </span>
      </div>

      {geoStatus && (
        <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400">{geoStatus}</p>
      )}
    </div>
  );
};
