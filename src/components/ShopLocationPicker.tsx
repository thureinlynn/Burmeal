import React, { useState } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  useApiLoadingStatus,
  APILoadingStatus,
  type MapMouseEvent,
} from '@vis.gl/react-google-maps';
import { MapPin, LocateFixed, RotateCcw, AlertTriangle } from 'lucide-react';
import {
  getDefaultCenterForCountry,
  hasValidCoordinates,
} from '../utils/shopLocationHelpers';

interface ShopLocationPickerProps {
  latitude?: number;
  longitude?: number;
  country?: string;
  city?: string;
  shopName?: string;
  onChange: (lat: number | undefined, lng: number | undefined) => void;
}

function getGoogleMapsApiKey(): string {
  const key = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
  if (!key || key === 'MY_GOOGLE_MAPS_API_KEY') return '';
  return key;
}

const MapCanvas: React.FC<{
  center: { lat: number; lng: number };
  hasPin: boolean;
  pinPosition: { lat: number; lng: number };
  shopName?: string;
  onSelectLocation: (lat: number, lng: number) => void;
}> = ({ center, hasPin, pinPosition, shopName, onSelectLocation }) => {
  const status = useApiLoadingStatus();

  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-5 text-center bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200">
        <AlertTriangle className="w-6 h-6 text-amber-600 mb-2" />
        <p className="text-xs font-bold">Interactive Google Map could not load right now</p>
        <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-1 max-w-md">
          You can still use "Use Current Location" above so your storefront Direction button works.
        </p>
      </div>
    );
  }

  if (status !== APILoadingStatus.LOADED) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-xs font-medium">
        Loading Google Maps picker...
      </div>
    );
  }

  const handleMapClick = (event: MapMouseEvent) => {
    const latLng = event.detail?.latLng;
    if (!latLng) return;
    onSelectLocation(Number(latLng.lat.toFixed(6)), Number(latLng.lng.toFixed(6)));
  };

  const handleMarkerDragEnd = (event: {
    latLng?: {
      lat: number | (() => number);
      lng: number | (() => number);
    } | null;
  }) => {
    const latLng = event.latLng;
    if (!latLng) return;
    const lat = typeof latLng.lat === 'function' ? latLng.lat() : Number(latLng.lat);
    const lng = typeof latLng.lng === 'function' ? latLng.lng() : Number(latLng.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      onSelectLocation(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
    }
  };

  return (
    <GoogleMap
      mapId="DEMO_MAP_ID"
      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
      defaultCenter={center}
      defaultZoom={hasPin ? 15 : 12}
      gestureHandling="greedy"
      clickableIcons={false}
      onClick={handleMapClick}
      style={{ width: '100%', height: '100%' }}
    >
      {hasPin && (
        <AdvancedMarker
          position={pinPosition}
          draggable
          onDragEnd={handleMarkerDragEnd}
          title={shopName || 'Shop Pick-Up Location'}
        >
          <Pin background="#d97706" borderColor="#92400e" glyphColor="#ffffff" />
        </AdvancedMarker>
      )}
    </GoogleMap>
  );
};

export const ShopLocationPicker: React.FC<ShopLocationPickerProps> = ({
  latitude,
  longitude,
  country,
  city,
  shopName,
  onChange,
}) => {
  const apiKey = getGoogleMapsApiKey();
  const hasPin = hasValidCoordinates(latitude, longitude);
  const fallbackCenter = getDefaultCenterForCountry(country, city);
  const activeCenter = hasPin
    ? { lat: Number(latitude), lng: Number(longitude) }
    : fallbackCenter;

  const [geoStatus, setGeoStatus] = useState<string>('');
  const [isLocating, setIsLocating] = useState(false);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Browser geolocation is unavailable on this device.');
      return;
    }
    setIsLocating(true);
    setGeoStatus('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        onChange(lat, lng);
        setGeoStatus('Pinned your current GPS location.');
        setIsLocating(false);
      },
      (err) => {
        setGeoStatus(err.message || 'Could not read current location permission.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
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
            <span>Pick Shop Location</span>
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

      {/* Explicit non-zero container height required by Maps JS SDK */}
      <div className="w-full h-[320px] rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 relative">
        {apiKey ? (
          <APIProvider apiKey={apiKey} libraries={['marker']}>
            <MapCanvas
              center={activeCenter}
              hasPin={hasPin}
              pinPosition={activeCenter}
              shopName={shopName}
              onSelectLocation={(lat, lng) => {
                setGeoStatus('');
                onChange(lat, lng);
              }}
            />
          </APIProvider>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-5 text-center bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
            <MapPin className="w-7 h-7 text-amber-600 mb-2" />
            <p className="text-xs font-bold text-stone-800 dark:text-stone-100">
              Google Maps API key not detected in runtime environment
            </p>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 max-w-md">
              Use "Use Current Location" above to set your shop pin for the storefront Direction button.
            </p>
          </div>
        )}
      </div>

      {geoStatus && (
        <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400">{geoStatus}</p>
      )}
    </div>
  );
};
