"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";

// Dynamically import Leaflet components
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const useMapEvents = dynamic(
  () => import("react-leaflet").then((mod) => mod.useMapEvents),
  { ssr: false }
) as unknown as typeof import("react-leaflet").useMapEvents;

interface LocationPickerProps {
  latitude?: number | string | null;
  longitude?: number | string | null;
  onLocationChange: (lat: number, lng: number) => void;
}

// Component to handle map clicks
function LocationMarker({
  position,
  setPosition,
}: {
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
}) {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
}: LocationPickerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [L, setL] = useState<typeof import("leaflet") | null>(null);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [searchAddress, setSearchAddress] = useState("");
  const [searching, setSearching] = useState(false);

  // Turkey center coordinates
  const defaultCenter: [number, number] = [39.0, 35.0];
  const defaultZoom = 6;

  useEffect(() => {
    setIsMounted(true);
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
    });
    import("leaflet/dist/leaflet.css");
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      const lat = typeof latitude === "string" ? parseFloat(latitude) : latitude;
      const lng = typeof longitude === "string" ? parseFloat(longitude) : longitude;
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        setPosition([lat, lng]);
      }
    }
  }, [latitude, longitude]);

  const handlePositionChange = useCallback(
    (pos: [number, number]) => {
      setPosition(pos);
      onLocationChange(pos[0], pos[1]);
    },
    [onLocationChange]
  );

  // Parse Google Maps URL
  const parseGoogleMapsUrl = () => {
    if (!googleMapsUrl) return;

    // Try different Google Maps URL formats
    let lat: number | null = null;
    let lng: number | null = null;

    // Format: https://www.google.com/maps?q=41.0082,28.9784
    // Format: https://www.google.com/maps/@41.0082,28.9784,15z
    // Format: https://maps.google.com/maps?ll=41.0082,28.9784
    // Format: https://goo.gl/maps/... (need to extract from redirected URL)

    // Pattern 1: @lat,lng or q=lat,lng
    const coordMatch = googleMapsUrl.match(/[@?&](-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (coordMatch) {
      lat = parseFloat(coordMatch[1]);
      lng = parseFloat(coordMatch[2]);
    }

    // Pattern 2: ll=lat,lng
    const llMatch = googleMapsUrl.match(/ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (!lat && llMatch) {
      lat = parseFloat(llMatch[1]);
      lng = parseFloat(llMatch[2]);
    }

    // Pattern 3: place/.../@lat,lng
    const placeMatch = googleMapsUrl.match(/place\/[^/]+\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (!lat && placeMatch) {
      lat = parseFloat(placeMatch[1]);
      lng = parseFloat(placeMatch[2]);
    }

    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      handlePositionChange([lat, lng]);
      setGoogleMapsUrl("");
    } else {
      alert("Google Maps linkinden konum çıkarılamadı. Lütfen geçerli bir link girin.");
    }
  };

  // Search address using Nominatim (OpenStreetMap)
  const searchByAddress = async () => {
    if (!searchAddress.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchAddress + ", Türkiye"
        )}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        handlePositionChange([lat, lng]);
        setSearchAddress("");
      } else {
        alert("Adres bulunamadı. Lütfen farklı bir adres deneyin.");
      }
    } catch (error) {
      console.error("Address search error:", error);
      alert("Adres arama sırasında bir hata oluştu.");
    } finally {
      setSearching(false);
    }
  };

  // Manual coordinate input
  const handleManualInput = () => {
    const latStr = prompt("Enlem (Latitude) girin:", position?.[0]?.toString() || "");
    const lngStr = prompt("Boylam (Longitude) girin:", position?.[1]?.toString() || "");

    if (latStr && lngStr) {
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      if (!isNaN(lat) && !isNaN(lng)) {
        handlePositionChange([lat, lng]);
      }
    }
  };

  if (!isMounted || !L) {
    return (
      <div className="location-picker-loading">
        <i className="fa-solid fa-spinner fa-spin"></i>
        <span>Harita yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="location-picker">
      <div className="location-picker-controls">
        <div className="location-input-group">
          <input
            type="text"
            className="search-input"
            placeholder="Google Maps linki yapıştırın..."
            value={googleMapsUrl}
            onChange={(e) => setGoogleMapsUrl(e.target.value)}
          />
          <button type="button" className="btn btn-outline" onClick={parseGoogleMapsUrl}>
            <i className="fa-solid fa-link"></i>
          </button>
        </div>

        <div className="location-input-group">
          <input
            type="text"
            className="search-input"
            placeholder="Adres ile ara..."
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), searchByAddress())}
          />
          <button
            type="button"
            className="btn btn-outline"
            onClick={searchByAddress}
            disabled={searching}
          >
            {searching ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-search"></i>}
          </button>
        </div>

        <button type="button" className="btn btn-outline" onClick={handleManualInput}>
          <i className="fa-solid fa-keyboard"></i> Manuel Giriş
        </button>
      </div>

      <div className="location-picker-map">
        <MapContainer
          center={position || defaultCenter}
          zoom={position ? 15 : defaultZoom}
          style={{ height: "100%", width: "100%", borderRadius: "8px" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={handlePositionChange} />
        </MapContainer>
      </div>

      {position && (
        <div className="location-picker-coords">
          <i className="fa-solid fa-location-dot"></i>
          <span>
            Enlem: {position[0].toFixed(6)}, Boylam: {position[1].toFixed(6)}
          </span>
          <button
            type="button"
            className="btn-clear"
            onClick={() => {
              setPosition(null);
              onLocationChange(0, 0);
            }}
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
      )}

      <p className="location-picker-hint">
        <i className="fa-solid fa-info-circle"></i>
        Haritaya tıklayarak konum seçebilir, Google Maps linki yapıştırabilir veya adres arayabilirsiniz.
      </p>
    </div>
  );
}
