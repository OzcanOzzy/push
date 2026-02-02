"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useRef, type FormEvent, type DragEvent, Suspense } from "react";
import { API_BASE_URL, fetchJson } from "../../../../lib/api";

type City = { id: string; name: string; slug: string };
type District = { id: string; name: string; cityId: string };
type Neighborhood = { id: string; name: string; districtId: string };
type Branch = { id: string; name: string; cityId: string; districtId?: string | null };

type ListingAttributeDefinition = {
  id: string;
  status?: string | null;
  category: string;
  subPropertyType?: string | null;
  key: string;
  label: string;
  type: "TEXT" | "NUMBER" | "SELECT" | "BOOLEAN";
  options?: string[] | null;
  allowsMultiple?: boolean | null;
  isRequired?: boolean | null;
  sortOrder?: number | null;
  groupName?: string | null;
  suffix?: string | null;
};

// Fiyat formatlama: 1000000 -> 1.000.000
function formatPriceInput(value: string): string {
  // Sadece rakamları al
  const numbers = value.replace(/\D/g, "");
  // Nokta ile ayır
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Fiyat parse: 1.000.000 -> 1000000
function parsePriceInput(value: string): string {
  return value.replace(/\./g, "");
}

// Şehir/ilçe/mahalle isimlerini düzelt (KONYA -> Konya, MERAM -> Meram)
function toTitleCase(str: string): string {
  if (!str) return str;
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => {
      if (word.length === 0) return word;
      // Türkçe karakterler için özel işlem
      const firstChar = word.charAt(0);
      const upperFirst = firstChar === "i" ? "İ" : firstChar.toUpperCase();
      return upperFirst + word.slice(1);
    })
    .join(" ");
}

const SUB_PROPERTY_TYPES: Record<string, { value: string; label: string }[]> = {
  HOUSING: [
    { value: "APART", label: "Apart" },
    { value: "DAIRE", label: "Daire" },
    { value: "DUBLEX", label: "Dublex" },
    { value: "TRIPLEX", label: "Triplex" },
    { value: "VILLA", label: "Villa" },
    { value: "MUSTAKIL_EV", label: "Müstakil Ev" },
    { value: "DEVREMULK", label: "Devremülk" },
    { value: "DIGER", label: "Diğer" },
  ],
  LAND: [
    { value: "KONUT_ARSASI", label: "Konut Arsası" },
    { value: "TICARI_ARSA", label: "Ticari Arsa" },
    { value: "KONUT_TICARI_ARSA", label: "Konut + Ticari Arsa" },
    { value: "OTEL_ARSASI", label: "Otel Arsası" },
    { value: "SANAYI_ARSASI", label: "Sanayi Arsası" },
    { value: "AVM_ARSASI", label: "AVM Arsası" },
    { value: "DIGER", label: "Diğer" },
  ],
  COMMERCIAL: [
    { value: "DUKKAN", label: "Dükkan" },
    { value: "OFIS", label: "Ofis" },
    { value: "DEPO", label: "Depo" },
    { value: "SANAYI_DUKKANI", label: "Sanayi Dükkanı" },
    { value: "OTEL", label: "Otel" },
    { value: "FABRIKA", label: "Fabrika" },
    { value: "DIGER", label: "Diğer" },
  ],
  TRANSFER: [
    { value: "DUKKAN", label: "Dükkan" },
    { value: "OFIS", label: "Ofis" },
    { value: "DEPO", label: "Depo" },
    { value: "SANAYI_DUKKANI", label: "Sanayi Dükkanı" },
    { value: "OTEL", label: "Otel" },
    { value: "FABRIKA", label: "Fabrika" },
    { value: "DIGER", label: "Diğer" },
  ],
  FIELD: [
    { value: "SULU", label: "Sulu" },
    { value: "KIRAC", label: "Kıraç" },
    { value: "VERIMLI", label: "Verimli" },
    { value: "TASLIK", label: "Taşlık" },
    { value: "MARJINAL", label: "Marjinal" },
  ],
  GARDEN: [
    { value: "ELMA", label: "Elma Bahçesi" },
    { value: "CEVIZ", label: "Ceviz Bahçesi" },
    { value: "ZEYTIN", label: "Zeytin Bahçesi" },
    { value: "BADEM", label: "Badem Bahçesi" },
    { value: "ERIK", label: "Erik Bahçesi" },
    { value: "KIRAZ", label: "Kiraz Bahçesi" },
    { value: "UZUM_BAGI", label: "Üzüm Bağı" },
    { value: "KARISIK", label: "Meyve Bahçesi (Karışık)" },
    { value: "DIGER", label: "Diğer" },
  ],
  HOBBY_GARDEN: [],
};

const statusOptions = [
  { value: "FOR_SALE", label: "Satılık" },
  { value: "FOR_RENT", label: "Kiralık" },
];

const categoryOptionsForSale = [
  { value: "HOUSING", label: "Konut" },
  { value: "LAND", label: "Arsa" },
  { value: "COMMERCIAL", label: "Ticari (Mülkiyet)" },
  { value: "TRANSFER", label: "Devren Satılık" },
  { value: "FIELD", label: "Tarla" },
  { value: "GARDEN", label: "Bahçe" },
  { value: "HOBBY_GARDEN", label: "Hobi Bahçesi" },
];

const categoryOptionsForRent = [
  { value: "HOUSING", label: "Konut" },
  { value: "COMMERCIAL", label: "Ticari" },
];

// Grup sıralama önceliği
const GROUP_ORDER = [
  "Temel Bilgiler",
  "Banyo/Tuvalet",
  "Balkon",
  "İç Özellikler",
  "Dış Özellikler",
  "Isıtma/Yalıtım",
  "Eşya",
  "Ödeme/Durum",
  "Site/Güvenlik",
  "Aktiviteler",
  "Muhit",
  "Diğer",
];

// Wrapper for Suspense
export default function NewListingPageWrapper() {
  return (
    <Suspense fallback={
      <main className="section">
        <div className="container" style={{ textAlign: "center", padding: "60px 20px" }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32 }}></i>
          <p style={{ marginTop: 16 }}>Yükleniyor...</p>
        </div>
      </main>
    }>
      <NewListingPage />
    </Suspense>
  );
}

function NewListingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId"); // Düzenleme modu için
  const isEditMode = Boolean(editId);
  
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [existingImages, setExistingImages] = useState<{ id: string; url: string; isCover: boolean }[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [attributeDefinitions, setAttributeDefinitions] = useState<ListingAttributeDefinition[]>([]);
  const [formError, setFormError] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "saving">("idle");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const [virtualTourFile, setVirtualTourFile] = useState<File | null>(null);
  const [virtualTourUploadMode, setVirtualTourUploadMode] = useState<"url" | "file">("url");
  const [mapLayer, setMapLayer] = useState<"street" | "satellite" | "hybrid">("street");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const virtualTourInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const boundaryLayerRef = useRef<ReturnType<typeof import("leaflet").geoJSON> | null>(null);
  
  const [formState, setFormState] = useState({
    listingNo: "",
    title: "",
    description: "",
    status: "FOR_SALE",
    category: "",
    subPropertyType: "",
    price: "",
    areaGross: "",
    areaNet: "",
    isOpportunity: false,
    cityId: "",
    districtId: "",
    neighborhoodId: "",
    branchId: "",
    latitude: "",
    longitude: "",
    googleMapsUrl: "",
    hideLocation: false,
    attributes: {} as Record<string, string | boolean | string[]>,
    slug: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    videoUrl: "",
    virtualTourUrl: "",
    virtualTourType: "",
  });

  const availableBranches = useMemo(() => {
    if (!formState.cityId) return branches;
    return branches.filter((b) => b.cityId === formState.cityId);
  }, [branches, formState.cityId]);

  const currentCategoryOptions = formState.status === "FOR_RENT" ? categoryOptionsForRent : categoryOptionsForSale;

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthed(Boolean(token));
    setIsReady(true);
    
    Promise.all([
      fetchJson<City[]>("/cities", { cache: "no-store" }),
      fetchJson<Branch[]>("/branches", { cache: "no-store" }),
    ]).then(([cityData, branchData]) => {
      setCities(cityData);
      setBranches(branchData);
    }).catch(() => {});
  }, []);

  // Düzenleme modu: Mevcut ilanı yükle
  useEffect(() => {
    if (!editId || !isReady || !isAuthed) return;
    
    setIsLoadingExisting(true);
    const token = localStorage.getItem("auth_token");
    
    fetch(`${API_BASE_URL}/listings/${editId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Oturum süresi dolmuş. Lütfen tekrar giriş yapın.");
          }
          throw new Error(`İlan yüklenemedi (${res.status})`);
        }
        return res.json();
      })
      .then(async (listing) => {
        if (!listing || !listing.id) {
          setFormError("İlan bulunamadı");
          return;
        }
        
        // İlçeleri yükle
        if (listing.cityId) {
          const districtData = await fetchJson<District[]>(`/districts?cityId=${listing.cityId}`);
          setDistricts(districtData || []);
        }
        
        // Mahalleleri yükle
        if (listing.districtId) {
          const neighborhoodData = await fetchJson<Neighborhood[]>(`/neighborhoods?districtId=${listing.districtId}`);
          setNeighborhoods(neighborhoodData || []);
        }
        
        // Mevcut görselleri kaydet
        if (listing.images && listing.images.length > 0) {
          setExistingImages(listing.images);
        }
        
        // Form state'i doldur
        setFormState({
          listingNo: listing.listingNo || "",
          title: listing.title || "",
          description: listing.description || "",
          status: listing.status || "FOR_SALE",
          category: listing.category || "",
          subPropertyType: listing.subPropertyType || "",
          price: String(listing.price || ""),
          areaGross: String(listing.areaGross || ""),
          areaNet: String(listing.areaNet || ""),
          roomCount: listing.roomCount || "",
          floor: String(listing.floor ?? ""),
          totalFloors: String(listing.totalFloors ?? ""),
          heatingType: listing.heatingType || "",
          buildingAge: listing.buildingAge || "",
          isOpportunity: listing.isOpportunity || false,
          cityId: listing.cityId || "",
          districtId: listing.districtId || "",
          neighborhoodId: listing.neighborhoodId || "",
          branchId: listing.branchId || "",
          googleMapsUrl: "",
          latitude: String(listing.latitude || ""),
          longitude: String(listing.longitude || ""),
          hideLocation: listing.hideLocation || false,
          seoUrl: listing.slug || "",
          attributes: listing.attributes || {},
          videoUrl: listing.videoUrl || "",
          virtualTourUrl: listing.virtualTourUrl || "",
          virtualTourType: listing.virtualTourType || "",
        });
        
        // Video veya sanal tur varsa bölümleri aç
        if (listing.videoUrl) setShowVideoUpload(true);
        if (listing.virtualTourUrl) setShowVirtualTour(true);
      })
      .catch(err => {
        console.error("İlan yükleme hatası:", err);
        setFormError(err instanceof Error ? err.message : "İlan yüklenirken hata oluştu");
      })
      .finally(() => {
        setIsLoadingExisting(false);
      });
  }, [editId, isReady, isAuthed]);

  useEffect(() => {
    if (!formState.cityId) { setDistricts([]); setNeighborhoods([]); return; }
    fetchJson<District[]>(`/districts?cityId=${formState.cityId}`, { cache: "no-store" })
      .then(setDistricts).catch(() => setDistricts([]));
  }, [formState.cityId]);

  useEffect(() => {
    if (!formState.districtId) { setNeighborhoods([]); return; }
    fetchJson<Neighborhood[]>(`/neighborhoods?districtId=${formState.districtId}`, { cache: "no-store" })
      .then(setNeighborhoods).catch(() => setNeighborhoods([]));
  }, [formState.districtId]);

  useEffect(() => {
    if (!formState.category) { setAttributeDefinitions([]); return; }
    const params = new URLSearchParams();
    params.set("category", formState.category);
    if (formState.status) params.set("status", formState.status);
    if (formState.subPropertyType) params.set("subPropertyType", formState.subPropertyType);
    
    fetchJson<ListingAttributeDefinition[]>(`/listing-attributes?${params.toString()}`, { cache: "no-store" })
      .then(setAttributeDefinitions).catch(() => setAttributeDefinitions([]));
  }, [formState.category, formState.status, formState.subPropertyType]);

  // Leaflet harita - düzenleme modunda mevcut ilan yüklendikten sonra initialize et
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    // Düzenleme modunda, mevcut ilan henüz yüklenmediyse bekle
    if (isEditMode && isLoadingExisting) return;
    
    // Leaflet CSS ve JS yükle
    const linkId = "leaflet-css";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const scriptId = "leaflet-js";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => initMap();
      document.body.appendChild(script);
    } else if ((window as unknown as { L?: unknown }).L) {
      initMap();
    }
  }, [isReady, isEditMode, isLoadingExisting]);

  // Harita katman URL'leri
  const tileLayers = {
    street: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '© OpenStreetMap'
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: '© Esri'
    },
    hybrid: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: '© Esri, OpenStreetMap'
    }
  };

  const initMap = () => {
    const L = (window as unknown as { L: typeof import("leaflet") }).L;
    if (!L || !mapRef.current) return;
    
    // Eğer harita zaten initialize edildiyse ve düzenleme modunda koordinat varsa, sadece güncelle
    if (mapRef.current.dataset.initialized) {
      const existingMap = (mapRef.current as HTMLDivElement & { _leafletMap?: ReturnType<typeof import("leaflet").map> })._leafletMap;
      if (existingMap && formState.latitude && formState.longitude) {
        const lat = parseFloat(formState.latitude);
        const lng = parseFloat(formState.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          existingMap.setView([lat, lng], 15);
          existingMap.eachLayer((layer: ReturnType<typeof L.marker>) => {
            if (layer instanceof L.Marker) existingMap.removeLayer(layer);
          });
          L.marker([lat, lng]).addTo(existingMap);
        }
      }
      return;
    }
    
    mapRef.current.dataset.initialized = "true";
    const lat = formState.latitude ? parseFloat(formState.latitude) : 38.9637;
    const lng = formState.longitude ? parseFloat(formState.longitude) : 35.2433;
    const initialZoom = (formState.latitude && formState.longitude) ? 15 : 6;
    
    const map = L.map(mapRef.current).setView([lat, lng], initialZoom);
    
    // Varsayılan katman
    const baseLayer = L.tileLayer(tileLayers.street.url, { attribution: tileLayers.street.attribution });
    baseLayer.addTo(map);
    (mapRef.current as HTMLDivElement & { _baseLayer?: typeof baseLayer })._baseLayer = baseLayer;

    let marker: ReturnType<typeof L.marker> | null = null;
    if (formState.latitude && formState.longitude) {
      marker = L.marker([lat, lng]).addTo(map);
    }

    map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
      const { lat, lng } = e.latlng;
      setFormState(prev => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
      if (marker) map.removeLayer(marker);
      marker = L.marker([lat, lng]).addTo(map);
    });

    (mapRef.current as HTMLDivElement & { _leafletMap?: typeof map })._leafletMap = map;
  };

  // Harita katmanını değiştir
  const changeMapLayer = (layerType: "street" | "satellite" | "hybrid") => {
    setMapLayer(layerType);
    const map = (mapRef.current as HTMLDivElement & { _leafletMap?: ReturnType<typeof import("leaflet").map>, _baseLayer?: ReturnType<typeof import("leaflet").tileLayer>, _labelLayer?: ReturnType<typeof import("leaflet").tileLayer> })?._leafletMap;
    const currentBase = (mapRef.current as HTMLDivElement & { _baseLayer?: ReturnType<typeof import("leaflet").tileLayer> })?._baseLayer;
    const currentLabel = (mapRef.current as HTMLDivElement & { _labelLayer?: ReturnType<typeof import("leaflet").tileLayer> })?._labelLayer;
    
    if (!map) return;
    const L = (window as unknown as { L: typeof import("leaflet") }).L;
    if (!L) return;

    // Boundary layer'ı geçici olarak kaldır (sonra tekrar ekleyeceğiz)
    const hadBoundary = boundaryLayerRef.current;
    if (hadBoundary) map.removeLayer(hadBoundary);

    // Eski katmanları kaldır
    if (currentBase) map.removeLayer(currentBase);
    if (currentLabel) map.removeLayer(currentLabel);

    // Yeni katmanı ekle
    const layer = tileLayers[layerType];
    const newBase = L.tileLayer(layer.url, { attribution: layer.attribution });
    newBase.addTo(map);
    (mapRef.current as HTMLDivElement & { _baseLayer?: typeof newBase })._baseLayer = newBase;

    // Hybrid modunda etiket katmanı ekle
    if (layerType === "hybrid") {
      const labelLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png", {
        attribution: '© CARTO',
        pane: 'overlayPane'
      });
      labelLayer.addTo(map);
      (mapRef.current as HTMLDivElement & { _labelLayer?: typeof labelLayer })._labelLayer = labelLayer;
    }

    // Boundary layer'ı tekrar ekle (en üstte görünsün)
    if (hadBoundary) {
      hadBoundary.addTo(map);
    }
  };

  // Koordinat değiştiğinde haritayı güncelle
  useEffect(() => {
    if (!mapRef.current) return;
    const map = (mapRef.current as HTMLDivElement & { _leafletMap?: ReturnType<typeof import("leaflet").map> })._leafletMap;
    if (!map) return;
    
    const L = (window as unknown as { L: typeof import("leaflet") }).L;
    if (!L) return;

    if (formState.latitude && formState.longitude) {
      const lat = parseFloat(formState.latitude);
      const lng = parseFloat(formState.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        map.setView([lat, lng], 15);
        // Marker güncelle
        map.eachLayer((layer: ReturnType<typeof L.marker>) => {
          if (layer instanceof L.Marker) map.removeLayer(layer);
        });
        L.marker([lat, lng]).addTo(map);
      }
    }
  }, [formState.latitude, formState.longitude]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormState((prev) => {
      const updates: Record<string, string | boolean | Record<string, string | boolean | string[]>> = { [field]: value };
      if (field === "cityId") { updates.districtId = ""; updates.neighborhoodId = ""; }
      else if (field === "districtId") { updates.neighborhoodId = ""; }
      else if (field === "status") {
        const validCategories = value === "FOR_RENT" ? ["HOUSING", "COMMERCIAL"] : categoryOptionsForSale.map(c => c.value);
        if (!validCategories.includes(prev.category)) { updates.category = ""; updates.subPropertyType = ""; updates.attributes = {}; }
      }
      else if (field === "category") { updates.subPropertyType = ""; updates.attributes = {}; }
      return { ...prev, ...updates };
    });
  };

  // Şehir/ilçe/mahalle seçildiğinde haritayı o bölgeye yakınlaştır (Overpass API ile)
  const zoomToLocation = async (cityName: string, districtName?: string, neighborhoodName?: string) => {
    const map = (mapRef.current as HTMLDivElement & { _leafletMap?: ReturnType<typeof import("leaflet").map> })?._leafletMap;
    if (!map) {
      console.log("Harita henüz yüklenmedi");
      return;
    }
    
    const L = (window as unknown as { L: typeof import("leaflet") }).L;
    if (!L) {
      console.log("Leaflet yüklenmedi");
      return;
    }

    // Önceki sınır katmanını temizle
    if (boundaryLayerRef.current) {
      map.removeLayer(boundaryLayerRef.current);
      boundaryLayerRef.current = null;
    }

    const city = toTitleCase(cityName);
    const district = districtName ? toTitleCase(districtName) : "";
    const neighborhood = neighborhoodName ? toTitleCase(neighborhoodName) : "";

    // Overpass API ile sınır çek
    // Türkiye: İl=4, İlçe=6, Mahalle=8 veya 9
    const fetchOverpassBoundary = async (name: string, adminLevel: number, parentCity?: string): Promise<{ geojson: GeoJSON.GeoJsonObject | null; center: [number, number] | null }> => {
      console.log(`Overpass: ${name} (admin_level=${adminLevel})${parentCity ? ` in ${parentCity}` : ""}`);
      
      // İsim varyasyonlarını dene
      const nameVariations = [name];
      if (adminLevel === 8 || adminLevel === 9) {
        nameVariations.push(`${name} Mahallesi`);
        nameVariations.push(`${name} Mah.`);
      }
      
      for (const searchName of nameVariations) {
        // İlçe aramasında şehir sınırları içinde ara
        let query: string;
        if (adminLevel === 6 && parentCity) {
          // İlçe araması: Önce şehri bul, sonra içinde ilçeyi ara
          query = `
[out:json][timeout:15];
area["boundary"="administrative"]["admin_level"="4"]["name"~"^${parentCity}$",i]->.searchArea;
(
  relation["boundary"="administrative"]["admin_level"="6"]["name"~"^${searchName}$",i](area.searchArea);
);
out body;
>;
out skel qt;
`;
        } else if ((adminLevel === 8 || adminLevel === 9) && parentCity) {
          // Mahalle araması: Şehir sınırları içinde ara
          query = `
[out:json][timeout:15];
area["boundary"="administrative"]["admin_level"="4"]["name"~"^${parentCity}$",i]->.searchArea;
(
  relation["boundary"="administrative"]["admin_level"="${adminLevel}"]["name"~"^${searchName}$",i](area.searchArea);
);
out body;
>;
out skel qt;
`;
        } else {
          query = `
[out:json][timeout:10];
(
  relation["boundary"="administrative"]["admin_level"="${adminLevel}"]["name"~"^${searchName}$",i];
);
out body;
>;
out skel qt;
`;
        }
        try {
          const response = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `data=${encodeURIComponent(query)}`
          });
          
          if (!response.ok) {
            console.log("Overpass API hatası:", response.status);
            continue;
          }
          
          const data = await response.json();
          console.log(`Overpass yanıtı (${searchName}):`, data.elements?.length || 0, "element");
          
          if (data.elements && data.elements.length > 0) {
            // Relation'ı bul
            const relation = data.elements.find((e: { type: string }) => e.type === "relation");
            if (!relation) continue;
            
            // Way'leri bul ve GeoJSON oluştur
            const ways = data.elements.filter((e: { type: string }) => e.type === "way");
            const nodes = data.elements.filter((e: { type: string }) => e.type === "node");
            
            // Node'ları haritaya çevir (id -> {lat, lon})
            const nodeMap: Record<number, { lat: number; lon: number }> = {};
            nodes.forEach((n: { id: number; lat: number; lon: number }) => {
              nodeMap[n.id] = { lat: n.lat, lon: n.lon };
            });
            
            // Way'leri koordinatlara çevir
            const allCoords: [number, number][] = [];
            const polygonCoords: [number, number][][] = [];
            
            ways.forEach((w: { nodes: number[] }) => {
              const wayCoords: [number, number][] = [];
              w.nodes.forEach((nodeId: number) => {
                const node = nodeMap[nodeId];
                if (node) {
                  wayCoords.push([node.lon, node.lat]); // GeoJSON: [lng, lat]
                  allCoords.push([node.lat, node.lon]); // Leaflet: [lat, lng]
                }
              });
              if (wayCoords.length > 2) {
                polygonCoords.push(wayCoords);
              }
            });
            
            if (polygonCoords.length === 0) continue;
            
            // GeoJSON oluştur
            const geojson: GeoJSON.GeoJsonObject = polygonCoords.length === 1
              ? { type: "Polygon", coordinates: [polygonCoords[0]] }
              : { type: "MultiPolygon", coordinates: polygonCoords.map(c => [c]) };
            
            // Merkez hesapla
            if (allCoords.length > 0) {
              const sumLat = allCoords.reduce((sum, c) => sum + c[0], 0);
              const sumLng = allCoords.reduce((sum, c) => sum + c[1], 0);
              const center: [number, number] = [sumLat / allCoords.length, sumLng / allCoords.length];
              return { geojson, center };
            }
          }
        } catch (error) {
          console.log("Overpass hatası:", error);
        }
      }
      return { geojson: null, center: null };
    };

    // Nominatim ile merkez koordinatı al (fallback)
    const fetchNominatimCenter = async (searchQuery: string): Promise<{ lat: number; lng: number; bounds?: [[number, number], [number, number]] } | null> => {
      console.log("Nominatim:", searchQuery);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
          { headers: { "Accept": "application/json", "Accept-Language": "tr" } }
        );
        if (!response.ok) return null;
        const data = await response.json();
        if (data && data.length > 0) {
          const result = data[0];
          const bounds = result.boundingbox 
            ? [[parseFloat(result.boundingbox[0]), parseFloat(result.boundingbox[2])], [parseFloat(result.boundingbox[1]), parseFloat(result.boundingbox[3])]] as [[number, number], [number, number]]
            : undefined;
          return { lat: parseFloat(result.lat), lng: parseFloat(result.lon), bounds };
        }
      } catch (error) {
        console.log("Nominatim hatası:", error);
      }
      return null;
    };

    // Sınır çiz ve haritayı konumlandır
    const drawBoundary = (geojson: GeoJSON.GeoJsonObject | null, center: [number, number] | null, zoom: number, color = "#dc2626") => {
      if (geojson) {
        const boundaryLayer = L.geoJSON(geojson, {
          style: { color, weight: 3, fillColor: color, fillOpacity: 0.1, dashArray: "8, 4" }
        });
        boundaryLayer.addTo(map);
        boundaryLayerRef.current = boundaryLayer;
        map.fitBounds(boundaryLayer.getBounds(), { padding: [30, 30] });
        console.log("Sınır çizildi");
      } else if (center) {
        map.setView(center, zoom);
        // Daire çiz
        const radius = zoom >= 14 ? 500 : zoom >= 11 ? 3000 : 15000;
        const circle = L.circle(center, {
          radius, color, weight: 2, fillColor: color, fillOpacity: 0.1, dashArray: "8, 4"
        });
        circle.addTo(map);
        boundaryLayerRef.current = circle as unknown as ReturnType<typeof L.geoJSON>;
        console.log("Daire çizildi, yarıçap:", radius);
      }
    };

    // "Merkez" ilçesi için özel işlem
    const isMerkez = district.toLowerCase() === "merkez" || district.toLowerCase().includes("merkez");

    // 1. MAHALLE seçildiyse
    if (neighborhood && city) {
      console.log("=== MAHALLE ARANIYOR ===");
      
      // HIZLI: Önce Nominatim ile merkez al ve hemen zoom yap
      const queries = [
        `${neighborhood} Mahallesi, ${district || ""}, ${city}, Turkey`,
        `${neighborhood}, ${district || ""}, ${city}, Turkey`,
        `${neighborhood} Mahallesi, ${city}, Turkey`,
        `${neighborhood}, ${city}, Turkey`
      ].filter(q => !q.includes(", ,"));
      
      let quickLoc: { lat: number; lng: number; bounds?: [[number, number], [number, number]] } | null = null;
      for (const q of queries) {
        quickLoc = await fetchNominatimCenter(q);
        if (quickLoc) {
          // Hemen haritayı zoom yap
          if (quickLoc.bounds) {
            map.fitBounds(L.latLngBounds(quickLoc.bounds), { padding: [30, 30] });
          } else {
            map.setView([quickLoc.lat, quickLoc.lng], 16);
          }
          // Geçici daire çiz
          const tempCircle = L.circle([quickLoc.lat, quickLoc.lng], {
            radius: 300, color: "#f97316", weight: 2, fillColor: "#f97316", fillOpacity: 0.1, dashArray: "5, 5"
          });
          tempCircle.addTo(map);
          boundaryLayerRef.current = tempCircle as unknown as ReturnType<typeof L.geoJSON>;
          break;
        }
      }
      
      // ARKA PLAN: Overpass ile gerçek sınırı çek (async, beklemeden)
      (async () => {
        let result = await fetchOverpassBoundary(neighborhood, 8, city);
        if (!result.geojson) {
          result = await fetchOverpassBoundary(neighborhood, 9, city);
        }
        if (result.geojson && boundaryLayerRef.current) {
          // Eski dairei kaldır, gerçek sınırı çiz
          map.removeLayer(boundaryLayerRef.current);
          drawBoundary(result.geojson, result.center, 15);
        }
      })();
      
      // Nominatim bulunduysa hemen dön (Overpass arka planda devam eder)
      if (quickLoc) {
        return;
      }
      
      // Nominatim bulamadıysa fallback - ilçe/şehir merkezini göster
      console.log("Mahalle bulunamadı, üst seviyeye fallback");
      const fallbackQuery2 = isMerkez ? `${city}, Turkey` : `${district}, ${city}, Turkey`;
      const fallback = await fetchNominatimCenter(fallbackQuery2);
      if (fallback) {
        map.setView([fallback.lat, fallback.lng], 14);
        const circle = L.circle([fallback.lat, fallback.lng], {
          radius: 500, color: "#f97316", weight: 2, fillColor: "#f97316", fillOpacity: 0.15, dashArray: "5, 5"
        });
        circle.addTo(map);
        boundaryLayerRef.current = circle as unknown as ReturnType<typeof L.geoJSON>;
      }
      return;
    }

    // 2. İLÇE seçildiyse
    if (district && city) {
      console.log("=== İLÇE ARANIYOR ===");
      
      if (isMerkez) {
        // Merkez ilçe: şehri göster
        const loc = await fetchNominatimCenter(`${city}, Turkey`);
        if (loc) {
          if (loc.bounds) {
            map.fitBounds(L.latLngBounds(loc.bounds), { padding: [30, 30] });
          } else {
            map.setView([loc.lat, loc.lng], 11);
          }
          const circle = L.circle([loc.lat, loc.lng], {
            radius: 8000, color: "#dc2626", weight: 2, fillColor: "#dc2626", fillOpacity: 0.08, dashArray: "8, 4"
          });
          circle.addTo(map);
          boundaryLayerRef.current = circle as unknown as ReturnType<typeof L.geoJSON>;
        }
        return;
      }
      
      // HIZLI: Önce Nominatim ile merkez al ve hemen zoom yap
      const quickLoc = await fetchNominatimCenter(`${district}, ${city}, Turkey`);
      if (quickLoc) {
        if (quickLoc.bounds) {
          map.fitBounds(L.latLngBounds(quickLoc.bounds), { padding: [30, 30] });
        } else {
          map.setView([quickLoc.lat, quickLoc.lng], 12);
        }
        // Geçici daire çiz
        const tempCircle = L.circle([quickLoc.lat, quickLoc.lng], {
          radius: 5000, color: "#dc2626", weight: 2, fillColor: "#dc2626", fillOpacity: 0.1, dashArray: "8, 4"
        });
        tempCircle.addTo(map);
        boundaryLayerRef.current = tempCircle as unknown as ReturnType<typeof L.geoJSON>;
      }
      
      // ARKA PLAN: Overpass ile gerçek sınırı çek
      (async () => {
        const result = await fetchOverpassBoundary(district, 6, city);
        if (result.geojson && boundaryLayerRef.current) {
          map.removeLayer(boundaryLayerRef.current);
          drawBoundary(result.geojson, result.center, 12);
        }
      })();
      
      // Nominatim bulunduysa hemen dön
      if (quickLoc) {
        return;
      }
      return;
    }

    // 3. ŞEHİR seçildiyse
    if (city) {
      console.log("=== ŞEHİR ARANIYOR ===");
      
      // Overpass ile il sınırı
      const result = await fetchOverpassBoundary(city, 4);
      if (result.geojson) {
        drawBoundary(result.geojson, result.center, 9);
        return;
      }
      
      // Nominatim fallback
      const loc = await fetchNominatimCenter(`${city}, Turkey`);
      if (loc) {
        if (loc.bounds) {
          map.fitBounds(L.latLngBounds(loc.bounds), { padding: [30, 30] });
        } else {
          map.setView([loc.lat, loc.lng], 9);
        }
        const circle = L.circle([loc.lat, loc.lng], {
          radius: 20000, color: "#dc2626", weight: 2, fillColor: "#dc2626", fillOpacity: 0.08, dashArray: "8, 4"
        });
        circle.addTo(map);
        boundaryLayerRef.current = circle as unknown as ReturnType<typeof L.geoJSON>;
      }
    }
  };

  // Şube seçildiğinde otomatik olarak şehir/ilçe seç ve haritayı güncelle
  useEffect(() => {
    if (!formState.branchId) return;
    const branch = branches.find(b => b.id === formState.branchId);
    if (branch) {
      // Şubenin şehir ve ilçe bilgisini formState'e aktar
      const updates: Partial<typeof formState> = {};
      if (branch.cityId && branch.cityId !== formState.cityId) {
        updates.cityId = branch.cityId;
      }
      if (branch.districtId && branch.districtId !== formState.districtId) {
        updates.districtId = branch.districtId;
      }
      if (Object.keys(updates).length > 0) {
        setFormState(prev => ({ ...prev, ...updates }));
      }
    }
  }, [formState.branchId, branches]);

  // Şehir/ilçe/mahalle değiştiğinde haritayı yakınlaştır
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!formState.cityId) return;
      const city = cities.find(c => c.id === formState.cityId);
      if (city) {
        const district = formState.districtId ? districts.find(d => d.id === formState.districtId) : undefined;
        const neighborhood = formState.neighborhoodId ? neighborhoods.find(n => n.id === formState.neighborhoodId) : undefined;
        console.log("Konum araması başlatılıyor:", city.name, district?.name, neighborhood?.name);
        zoomToLocation(city.name, district?.name, neighborhood?.name);
      }
    }, 500); // 500ms bekle - haritanın yüklenmesi için
    return () => clearTimeout(timer);
  }, [formState.cityId, formState.districtId, formState.neighborhoodId]);

  const handleAttributeChange = (key: string, value: string | boolean | string[]) => {
    setFormState((prev) => ({ ...prev, attributes: { ...prev.attributes, [key]: value } }));
  };

  // Google Maps URL'den koordinat çıkar - tüm formatları destekle
  const extractCoordsFromUrl = (url: string): { lat: string; lng: string } | null => {
    if (!url) return null;
    
    console.log("URL analiz ediliyor:", url);
    
    // Farklı Google Maps URL formatları
    const patterns = [
      // @37.8749,32.4932 formatı (en yaygın)
      /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      // !3d37.8749!4d32.4932 formatı
      /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/,
      // q=37.8749,32.4932 formatı
      /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      // place/37.8749,32.4932 formatı
      /place\/(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      // ll=37.8749,32.4932 formatı
      /[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      // center=37.8749,32.4932 formatı
      /center=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      // data içinde koordinat
      /data=.*!8m2!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1] && match[2]) {
        const lat = match[1];
        const lng = match[2];
        // Koordinatların geçerli olup olmadığını kontrol et
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        if (latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180) {
          console.log("Koordinat bulundu:", lat, lng);
          return { lat, lng };
        }
      }
    }
    
    console.log("Koordinat bulunamadı");
    return null;
  };

  const handleGoogleMapsUrlChange = (url: string) => {
    setFormState(prev => ({ ...prev, googleMapsUrl: url }));
  };

  // Kısa Google Maps linkini çöz (goo.gl, maps.app.goo.gl)
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);

  // Google Maps linkinden koordinat bul ve haritada göster
  const findLocationFromUrl = async () => {
    const url = formState.googleMapsUrl;
    console.log("Bul butonuna basıldı, URL:", url);
    
    if (!url || url.trim() === "") {
      alert("Lütfen önce bir Google Maps linki yapıştırın.");
      return;
    }

    // Kısa link mi kontrol et (goo.gl, maps.app.goo.gl)
    const isShortUrl = url.includes("goo.gl") || url.includes("maps.app");
    
    if (isShortUrl) {
      setIsResolvingUrl(true);
      try {
        // Backend üzerinden kısa URL'yi çöz
        const response = await fetch(`${API_BASE_URL}/utils/resolve-url?url=${encodeURIComponent(url)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.resolvedUrl) {
            console.log("Çözülen URL:", data.resolvedUrl);
            const coords = extractCoordsFromUrl(data.resolvedUrl);
            if (coords) {
              applyCoordinates(coords.lat, coords.lng);
              setIsResolvingUrl(false);
              return;
            }
          }
        }
      } catch (error) {
        console.log("URL çözme hatası:", error);
      }
      setIsResolvingUrl(false);
      
      // Backend çalışmadıysa kullanıcıya bilgi ver
      alert("Kısa link (goo.gl) formatı desteklenmiyor.\n\nLütfen Google Maps'te konumu açıp, tarayıcının adres çubuğundan TAM URL'yi kopyalayın.\n\nÖrnek:\nhttps://www.google.com/maps/@37.8749,32.4932,17z");
      return;
    }
    
    const coords = extractCoordsFromUrl(url);
    
    if (coords) {
      applyCoordinates(coords.lat, coords.lng);
    } else {
      alert("Google Maps linkinden koordinat çıkarılamadı.\n\nLütfen tarayıcının adres çubuğundan TAM URL'yi kopyalayın.\n\nÖrnek:\nhttps://www.google.com/maps/@37.8749,32.4932,17z");
    }
  };

  // Koordinatları uygula ve haritada göster
  const applyCoordinates = (latStr: string, lngStr: string) => {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    
    console.log("Koordinatlar ayarlanıyor:", lat, lng);
    
    // State'i güncelle
    setFormState(prev => ({ 
      ...prev, 
      latitude: lat.toFixed(6), 
      longitude: lng.toFixed(6) 
    }));
    
    // Haritada göster
    const map = (mapRef.current as HTMLDivElement & { _leafletMap?: ReturnType<typeof import("leaflet").map> })?._leafletMap;
    const L = (window as unknown as { L: typeof import("leaflet") }).L;
    
    if (map && L) {
      console.log("Harita güncelleniyor");
      
      // Önceki sınır katmanını temizle
      if (boundaryLayerRef.current) {
        map.removeLayer(boundaryLayerRef.current);
        boundaryLayerRef.current = null;
      }
      
      // Önceki marker'ları temizle
      map.eachLayer((layer: ReturnType<typeof L.layer>) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });
      
      // Haritayı konuma götür
      map.setView([lat, lng], 17);
      
      // Marker ekle
      const marker = L.marker([lat, lng]);
      marker.addTo(map);
      
      console.log("Marker eklendi");
    }
  };

  // Sürükle-bırak fotoğraf yükleme
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    if (coverIndex === index) setCoverIndex(0);
    else if (coverIndex > index) setCoverIndex(coverIndex - 1);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    const token = localStorage.getItem("auth_token");
    if (!token) { setFormError("Giriş yapmanız gerekiyor."); return; }
    if (!formState.cityId || !formState.branchId || !formState.category) {
      setFormError("Şehir, şube ve kategori zorunludur."); return;
    }

    setSubmitState("saving");
    try {
      const payload = {
        listingNo: formState.listingNo || undefined,
        title: formState.title,
        description: formState.description,
        status: formState.status,
        category: formState.category,
        subPropertyType: formState.subPropertyType || undefined,
        price: formState.price ? Number(formState.price) : undefined,
        areaGross: formState.areaGross ? Number(formState.areaGross) : undefined,
        areaNet: formState.areaNet ? Number(formState.areaNet) : undefined,
        currency: "TRY",
        isOpportunity: formState.isOpportunity,
        cityId: formState.cityId,
        districtId: formState.districtId || undefined,
        neighborhoodId: formState.neighborhoodId || undefined,
        branchId: formState.branchId,
        latitude: formState.latitude ? Number(formState.latitude) : undefined,
        longitude: formState.longitude ? Number(formState.longitude) : undefined,
        googleMapsUrl: formState.googleMapsUrl || undefined,
        hideLocation: formState.hideLocation,
        attributes: formState.attributes ?? {},
        slug: formState.slug || undefined,
        metaTitle: formState.metaTitle || undefined,
        metaDescription: formState.metaDescription || undefined,
        metaKeywords: formState.metaKeywords || undefined,
        videoUrl: formState.videoUrl || undefined,
        virtualTourUrl: formState.virtualTourUrl || undefined,
        virtualTourType: formState.virtualTourType || undefined,
      };

      // Düzenleme modu: PATCH, yeni ilan: POST
      const url = isEditMode ? `${API_BASE_URL}/listings/${editId}` : `${API_BASE_URL}/listings`;
      const method = isEditMode ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(isEditMode ? "İlan güncellenemedi." : "İlan kaydedilemedi.");
      const savedListing = await res.json();
      const listingId = isEditMode ? editId : savedListing.id;

      // Upload images if any (yeni yüklenen dosyalar)
      if (imageFiles.length > 0) {
        const formData = new FormData();
        // Kapak fotoğrafını en başa koy
        const reorderedFiles = [...imageFiles];
        if (coverIndex > 0) {
          const [cover] = reorderedFiles.splice(coverIndex, 1);
          reorderedFiles.unshift(cover);
        }
        reorderedFiles.forEach((file) => formData.append("files", file));
        formData.append("setFirstAsCover", "true");
        const imgRes = await fetch(`${API_BASE_URL}/listings/${listingId}/images/upload-many`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!imgRes.ok) {
          if (imgRes.status === 401) throw new Error("Oturum süresi dolmuş. Lütfen tekrar giriş yapın.");
          throw new Error("Fotoğraflar yüklenemedi.");
        }
      }

      // Upload video if any (dosya olarak)
      if (videoFile) {
        const videoFormData = new FormData();
        videoFormData.append("file", videoFile);
        const vidRes = await fetch(`${API_BASE_URL}/listings/${listingId}/video/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: videoFormData,
        });
        if (!vidRes.ok) {
          if (vidRes.status === 401) throw new Error("Oturum süresi dolmuş. Lütfen tekrar giriş yapın.");
          throw new Error("Video yüklenemedi.");
        }
      }

      // Upload virtual tour if any (dosya olarak)
      if (virtualTourFile) {
        const tourFormData = new FormData();
        tourFormData.append("file", virtualTourFile);
        tourFormData.append("tourType", formState.virtualTourType || "PANORAMA");
        const tourRes = await fetch(`${API_BASE_URL}/listings/${listingId}/virtual-tour/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: tourFormData,
        });
        if (!tourRes.ok) {
          if (tourRes.status === 401) throw new Error("Oturum süresi dolmuş. Lütfen tekrar giriş yapın.");
          throw new Error("Sanal tur yüklenemedi.");
        }
      }

      router.push("/admin/listings");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Hata oluştu.");
    } finally {
      setSubmitState("idle");
    }
  };

  // Grupları sırala
  const sortedGroups = useMemo(() => {
    const groups: Record<string, ListingAttributeDefinition[]> = {};
    attributeDefinitions.forEach((def) => {
      const g = def.groupName || "Diğer";
      if (!groups[g]) groups[g] = [];
      groups[g].push(def);
    });
    return Object.entries(groups).sort(([a], [b]) => {
      const ia = GROUP_ORDER.indexOf(a);
      const ib = GROUP_ORDER.indexOf(b);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });
  }, [attributeDefinitions]);

  if (!isReady || isLoadingExisting) return <main className="section"><div className="container"><div className="card"><div className="card-body" style={{ textAlign: "center" }}><i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, marginRight: 8 }}></i>{isEditMode ? "İlan yükleniyor..." : "Yükleniyor..."}</div></div></div></main>;
  if (!isAuthed) return <main className="section"><div className="container"><div className="card"><div className="card-body">Giriş yapın. <Link href="/admin/login" className="btn btn-outline">Giriş</Link></div></div></div></main>;

  return (
    <main className="section">
      <div className="container" style={{ maxWidth: 1000 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
            <i className={`fa-solid ${isEditMode ? "fa-edit" : "fa-plus"}`} style={{ marginRight: 12 }}></i>
            {isEditMode ? "İlan Düzenle" : "Yeni İlan Ekle"}
          </h1>
          <Link href="/admin/listings" className="btn btn-outline">
            <i className="fa-solid fa-arrow-left" style={{ marginRight: 8 }}></i>İlan Listesi
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 1. Status */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-body">
              <h3 className="card-title">1. İlan Türü</h3>
              <div style={{ display: "flex", gap: 12 }}>
                {statusOptions.map((o) => (
                  <button key={o.value} type="button" className={`btn ${formState.status === o.value ? "" : "btn-outline"}`}
                    onClick={() => handleChange("status", o.value)} style={{ flex: 1, padding: "14px 20px", fontSize: 15 }}>
                    <i className={`fa-solid ${o.value === "FOR_SALE" ? "fa-tag" : "fa-key"}`} style={{ marginRight: 8 }}></i>{o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Category */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-body">
              <h3 className="card-title">2. Gayrimenkul Tipi</h3>
              <div className="btn-grid">
                {currentCategoryOptions.map((o) => (
                  <button key={o.value} type="button" className={`btn ${formState.category === o.value ? "" : "btn-outline"}`}
                    onClick={() => handleChange("category", o.value)}>{o.label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Sub Property Type */}
          {formState.category && SUB_PROPERTY_TYPES[formState.category]?.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-body">
                <h3 className="card-title">3. Alt Kategori</h3>
                <div className="btn-grid">
                  {SUB_PROPERTY_TYPES[formState.category].map((o) => (
                    <button key={o.value} type="button" className={`btn btn-sm ${formState.subPropertyType === o.value ? "" : "btn-outline"}`}
                      onClick={() => handleChange("subPropertyType", o.value)}>{o.label}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. Basic Info + Dynamic Attributes (Combined) */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-body">
              <h3 className="card-title">İlan Bilgileri</h3>
              
              {/* Temel Bilgiler */}
              <div className="section-title">Temel Bilgiler</div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">İlan No (Opsiyonel)</label>
                  <input className="form-input" placeholder="00001" value={formState.listingNo} maxLength={5} style={{ maxWidth: 120 }}
                    onChange={(e) => handleChange("listingNo", e.target.value.replace(/\D/g, "").slice(0, 5))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Fiyat (TL)</label>
                  <input 
                    className="form-input" 
                    type="text" 
                    placeholder="0" 
                    value={formatPriceInput(formState.price)}
                    onChange={(e) => handleChange("price", parsePriceInput(e.target.value))} 
                  />
                </div>
                <div className="form-group" style={{ gridColumn: "span 2" }}></div>
                <div className="form-group" style={{ gridColumn: "span 4" }}>
                  <label className="form-label">Başlık *</label>
                  <input className="form-input" placeholder="İlan başlığı" value={formState.title} required minLength={3}
                    onChange={(e) => handleChange("title", e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn: "span 4" }}>
                  <label className="form-label">Açıklama *</label>
                  <textarea className="form-input" placeholder="İlan açıklaması" value={formState.description} required minLength={10} rows={6}
                    onChange={(e) => handleChange("description", e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn: "span 4" }}>
                  <label className="form-checkbox">
                    <input type="checkbox" checked={formState.isOpportunity} onChange={(e) => handleChange("isOpportunity", e.target.checked)} />
                    <span>Fırsat İlanı olarak işaretle</span>
                  </label>
                </div>
              </div>

              {/* Detaylı Özellikler */}
              {sortedGroups.length > 0 && sortedGroups.map(([groupName, defs]) => (
                <div key={groupName}>
                  <div className="section-title">{groupName}</div>
                  <div className="attr-grid">
                    {defs.map((def) => {
                      const val = formState.attributes?.[def.key];
                      if (def.type === "BOOLEAN") {
                        return (
                          <label key={def.id} className="form-checkbox">
                            <input type="checkbox" checked={Boolean(val)} onChange={(e) => handleAttributeChange(def.key, e.target.checked)} />
                            <span>{def.label}</span>
                          </label>
                        );
                      }
                      if (def.type === "SELECT" && def.allowsMultiple) {
                        const selected = Array.isArray(val) ? val : [];
                        return (
                          <div key={def.id} className="form-group multi-select">
                            <label className="form-label">{def.label}</label>
                            <div className="checkbox-list">
                              {(def.options || []).map((opt) => (
                                <label key={opt} className="form-checkbox-sm">
                                  <input type="checkbox" checked={selected.includes(opt)}
                                    onChange={(e) => handleAttributeChange(def.key, e.target.checked ? [...selected, opt] : selected.filter((x) => x !== opt))} />
                                  <span>{opt}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      if (def.type === "SELECT") {
                        return (
                          <div key={def.id} className="form-group">
                            <label className="form-label">{def.label}</label>
                            <select className="form-input" value={String(val || "")} onChange={(e) => handleAttributeChange(def.key, e.target.value)}>
                              <option value="">Seçiniz</option>
                              {(def.options || []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>
                        );
                      }
                      return (
                        <div key={def.id} className="form-group">
                          <label className="form-label">{def.label} {def.suffix && `(${def.suffix})`}</label>
                          <input className="form-input" type={def.type === "NUMBER" ? "number" : "text"} value={String(val || "")}
                            onChange={(e) => handleAttributeChange(def.key, e.target.value)} />
                        </div>
                      );
                    })}
                    {/* Temel Bilgiler grubunun sonuna Brüt ve Net m² ekle */}
                    {groupName === "Temel Bilgiler" && (
                      <>
                        <div className="form-group">
                          <label className="form-label">Brüt m²</label>
                          <input className="form-input" type="number" placeholder="0" value={formState.areaGross}
                            onChange={(e) => handleChange("areaGross", e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Net m²</label>
                          <input className="form-input" type="number" placeholder="0" value={formState.areaNet}
                            onChange={(e) => handleChange("areaNet", e.target.value)} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Photos with Drag & Drop */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-body">
              <h3 className="card-title"><i className="fa-solid fa-images" style={{ marginRight: 8 }}></i>Fotoğraflar</h3>
              
              {/* Mevcut Görseller (Düzenleme Modunda) */}
              {isEditMode && existingImages.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Mevcut Görseller ({existingImages.length})</p>
                  <div className="image-grid">
                    {existingImages.map((img) => (
                      <div key={img.id} className={`image-item ${img.isCover ? "cover" : ""}`}>
                        <img src={img.url.startsWith("http") ? img.url : `${API_BASE_URL}${img.url}`} alt="" />
                        {img.isCover && <div className="cover-badge">Kapak</div>}
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 8 }}>
                    Not: Mevcut görselleri silmek için API üzerinden işlem yapılmalı. Aşağıdan yeni görseller ekleyebilirsiniz.
                  </p>
                </div>
              )}
              
              <div 
                className={`drop-zone ${isDragging ? "dragging" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <i className="fa-solid fa-cloud-upload-alt" style={{ fontSize: 32, marginBottom: 8, color: "var(--color-primary)" }}></i>
                <p>{isEditMode ? "Yeni fotoğraf eklemek için sürükleyip bırakın veya tıklayın" : "Fotoğrafları sürükleyip bırakın veya tıklayın"}</p>
                <span style={{ fontSize: 12, color: "var(--color-muted)" }}>JPG, PNG, WebP - Maks. 10MB</span>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFileSelect} />
              
              {imageFiles.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <p style={{ fontSize: 13, marginBottom: 8, color: "var(--color-muted)" }}>
                    {imageFiles.length} fotoğraf seçildi. Kapak için tıklayın, silmek için X&apos;e basın.
                  </p>
                  <div className="image-grid">
                    {imageFiles.map((file, idx) => (
                      <div key={idx} className={`image-item ${coverIndex === idx ? "cover" : ""}`} onClick={() => setCoverIndex(idx)}>
                        <img src={URL.createObjectURL(file)} alt="" />
                        {coverIndex === idx && <div className="cover-badge">Kapak</div>}
                        <button type="button" className="remove-btn" onClick={(e) => { e.stopPropagation(); removeImage(idx); }}>
                          <i className="fa-solid fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Yükleme */}
              <div style={{ marginTop: 20, borderTop: "1px solid var(--color-border)", paddingTop: 16 }}>
                {!showVideoUpload ? (
                  <button type="button" className="btn btn-outline" onClick={() => setShowVideoUpload(true)}>
                    <i className="fa-solid fa-video" style={{ marginRight: 8 }}></i>
                    Video Yükle
                  </button>
                ) : (
                  <div className="video-upload-area">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <label className="form-label" style={{ margin: 0 }}>
                        <i className="fa-solid fa-video" style={{ marginRight: 6 }}></i>Video
                      </label>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => { setShowVideoUpload(false); removeVideo(); }}>
                        <i className="fa-solid fa-times" style={{ marginRight: 4 }}></i>Kapat
                      </button>
                    </div>
                    
                    {!videoFile ? (
                      <div className="video-drop-zone" onClick={() => videoInputRef.current?.click()}>
                        <i className="fa-solid fa-film" style={{ fontSize: 24, marginBottom: 8, color: "var(--color-primary)" }}></i>
                        <p>Video seçmek için tıklayın</p>
                        <span style={{ fontSize: 11, color: "var(--color-muted)" }}>MP4, WebM, MOV - Maks. 100MB</span>
                      </div>
                    ) : (
                      <div className="video-preview">
                        <video src={URL.createObjectURL(videoFile)} controls style={{ width: "100%", maxHeight: 200, borderRadius: 8 }} />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                          <span style={{ fontSize: 12, color: "var(--color-muted)" }}>
                            {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)
                          </span>
                          <button type="button" className="btn btn-outline btn-sm" onClick={removeVideo} style={{ color: "#ef4444" }}>
                            <i className="fa-solid fa-trash" style={{ marginRight: 4 }}></i>Sil
                          </button>
                        </div>
                      </div>
                    )}
                    <input ref={videoInputRef} type="file" accept="video/*" style={{ display: "none" }} onChange={handleVideoSelect} />
                  </div>
                )}
              </div>

              {/* Sanal Tur Ekleme */}
              <div style={{ marginTop: 20, borderTop: "1px solid var(--color-border)", paddingTop: 16 }}>
                {!showVirtualTour ? (
                  <button type="button" className="btn btn-outline" onClick={() => setShowVirtualTour(true)}>
                    <i className="fa-solid fa-vr-cardboard" style={{ marginRight: 8 }}></i>
                    Sanal Tur Ekle
                  </button>
                ) : (
                  <div className="virtual-tour-area">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <label className="form-label" style={{ margin: 0 }}>
                        <i className="fa-solid fa-vr-cardboard" style={{ marginRight: 6 }}></i>Sanal Tur / 3D Gezi
                      </label>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => { 
                        setShowVirtualTour(false); 
                        setVirtualTourFile(null);
                        setFormState(prev => ({ ...prev, virtualTourUrl: "", virtualTourType: "" })); 
                      }}>
                        <i className="fa-solid fa-times" style={{ marginRight: 4 }}></i>Kapat
                      </button>
                    </div>
                    
                    {/* Yükleme Modu Seçimi */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                      <button 
                        type="button" 
                        className={`btn btn-sm ${virtualTourUploadMode === "file" ? "" : "btn-outline"}`}
                        onClick={() => setVirtualTourUploadMode("file")}
                      >
                        <i className="fa-solid fa-upload" style={{ marginRight: 6 }}></i>Dosya Yükle
                      </button>
                      <button 
                        type="button" 
                        className={`btn btn-sm ${virtualTourUploadMode === "url" ? "" : "btn-outline"}`}
                        onClick={() => setVirtualTourUploadMode("url")}
                      >
                        <i className="fa-solid fa-link" style={{ marginRight: 6 }}></i>URL Gir
                      </button>
                    </div>

                    {virtualTourUploadMode === "file" ? (
                      <>
                        {/* Dosya Yükleme Modu */}
                        <div className="form-group" style={{ marginBottom: 12 }}>
                          <label className="form-label">Tur Tipi</label>
                          <select 
                            className="form-input" 
                            value={formState.virtualTourType} 
                            onChange={(e) => handleChange("virtualTourType", e.target.value)}
                          >
                            <option value="">Seçiniz</option>
                            <option value="PANORAMA">360° Panorama Fotoğraf</option>
                            <option value="VIDEO_360">360° Video</option>
                          </select>
                        </div>
                        
                        {!virtualTourFile ? (
                          <div 
                            className="video-drop-zone" 
                            onClick={() => virtualTourInputRef.current?.click()}
                            style={{ marginTop: 8 }}
                          >
                            <i className="fa-solid fa-vr-cardboard" style={{ fontSize: 24, marginBottom: 8, color: "var(--color-primary)" }}></i>
                            <p>360° fotoğraf veya video seçmek için tıklayın</p>
                            <span style={{ fontSize: 11, color: "var(--color-muted)" }}>JPG, PNG, MP4, WebM - Maks. 100MB</span>
                          </div>
                        ) : (
                          <div style={{ marginTop: 8, padding: 12, background: "#fff", borderRadius: 8, border: "1px solid var(--color-border)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <i className={`fa-solid ${virtualTourFile.type.startsWith("video/") ? "fa-film" : "fa-image"}`} style={{ fontSize: 20, color: "var(--color-primary)" }}></i>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 500 }}>{virtualTourFile.name}</div>
                                  <div style={{ fontSize: 11, color: "var(--color-muted)" }}>{(virtualTourFile.size / 1024 / 1024).toFixed(1)} MB</div>
                                </div>
                              </div>
                              <button 
                                type="button" 
                                className="btn btn-outline btn-sm" 
                                onClick={() => { setVirtualTourFile(null); if (virtualTourInputRef.current) virtualTourInputRef.current.value = ""; }}
                                style={{ color: "#ef4444" }}
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        )}
                        <input 
                          ref={virtualTourInputRef} 
                          type="file" 
                          accept="image/*,video/*" 
                          style={{ display: "none" }} 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setVirtualTourFile(file);
                              // Otomatik tip belirleme
                              if (file.type.startsWith("video/")) {
                                handleChange("virtualTourType", "VIDEO_360");
                              } else {
                                handleChange("virtualTourType", "PANORAMA");
                              }
                            }
                          }} 
                        />
                      </>
                    ) : (
                      <>
                        {/* URL Giriş Modu */}
                        <div className="form-grid" style={{ gap: 12 }}>
                          <div className="form-group" style={{ gridColumn: "span 2" }}>
                            <label className="form-label">Tur Tipi</label>
                            <select 
                              className="form-input" 
                              value={formState.virtualTourType} 
                              onChange={(e) => handleChange("virtualTourType", e.target.value)}
                            >
                              <option value="">Seçiniz</option>
                              <option value="MATTERPORT">Matterport</option>
                              <option value="IFRAME">Embed URL (iFrame)</option>
                              <option value="YOUTUBE_360">YouTube 360°</option>
                              <option value="KUULA">Kuula</option>
                              <option value="OTHER">Diğer</option>
                            </select>
                          </div>
                          <div className="form-group" style={{ gridColumn: "span 2" }}>
                            <label className="form-label">Sanal Tur URL&apos;si</label>
                            <input 
                              className="form-input" 
                              placeholder="https://my.matterport.com/show/?m=..." 
                              value={formState.virtualTourUrl} 
                              onChange={(e) => handleChange("virtualTourUrl", e.target.value)}
                            />
                            <span style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 4, display: "block" }}>
                              Matterport, Kuula veya benzeri platformların embed URL&apos;sini yapıştırın
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {(formState.virtualTourUrl || virtualTourFile) && (
                      <div style={{ marginTop: 12, padding: 12, background: "#f0fdf4", borderRadius: 8, border: "1px solid #86efac" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#166534", fontSize: 13 }}>
                          <i className="fa-solid fa-check-circle"></i>
                          Sanal tur {virtualTourFile ? "dosyası seçildi" : "linki eklendi"}. İlan sayfasında &quot;Daireyi Canlı Gez&quot; butonu görünecek.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 6. Location with Map */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-body">
              <h3 className="card-title"><i className="fa-solid fa-map-marker-alt" style={{ marginRight: 8 }}></i>Konum</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Şehir *</label>
                  <select className="form-input" value={formState.cityId} required onChange={(e) => handleChange("cityId", e.target.value)}>
                    <option value="">Seçiniz</option>
                    {cities.map((c) => <option key={c.id} value={c.id}>{toTitleCase(c.name)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">İlçe</label>
                  <select className="form-input" value={formState.districtId} disabled={!formState.cityId} onChange={(e) => handleChange("districtId", e.target.value)}>
                    <option value="">Seçiniz</option>
                    {districts.map((d) => <option key={d.id} value={d.id}>{toTitleCase(d.name)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Mahalle</label>
                  <select className="form-input" value={formState.neighborhoodId} disabled={!formState.districtId} onChange={(e) => handleChange("neighborhoodId", e.target.value)}>
                    <option value="">Seçiniz</option>
                    {neighborhoods.map((n) => <option key={n.id} value={n.id}>{toTitleCase(n.name)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Şube *</label>
                  <select className="form-input" value={formState.branchId} required onChange={(e) => handleChange("branchId", e.target.value)}>
                    <option value="">Seçiniz</option>
                    {availableBranches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: "span 4" }}>
                  <label className="form-label">Google Maps Linki</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input className="form-input" placeholder="https://maps.google.com/... veya https://goo.gl/maps/..." 
                      value={formState.googleMapsUrl} onChange={(e) => handleGoogleMapsUrlChange(e.target.value)} 
                      style={{ flex: 1 }} />
                    <button type="button" className="btn" onClick={findLocationFromUrl} 
                      disabled={isResolvingUrl}
                      style={{ whiteSpace: "nowrap", padding: "8px 16px" }}>
                      {isResolvingUrl ? (
                        <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 6 }}></i>Arıyor...</>
                      ) : (
                        <><i className="fa-solid fa-search" style={{ marginRight: 6 }}></i>Bul</>
                      )}
                    </button>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--color-muted)" }}>
                    Google Maps&apos;ten link kopyalayıp yapıştırın, sonra &quot;Bul&quot; butonuna basın
                  </span>
                </div>
                <div className="form-group">
                  <label className="form-label">Enlem</label>
                  <input className="form-input" type="number" step="0.000001" placeholder="37.8749" value={formState.latitude}
                    onChange={(e) => handleChange("latitude", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Boylam</label>
                  <input className="form-input" type="number" step="0.000001" placeholder="32.4932" value={formState.longitude}
                    onChange={(e) => handleChange("longitude", e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-checkbox">
                    <input type="checkbox" checked={formState.hideLocation} onChange={(e) => handleChange("hideLocation", e.target.checked)} />
                    <span>Konumu gizle (haritada gösterme)</span>
                  </label>
                </div>
              </div>
              
              {/* Harita */}
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <p style={{ fontSize: 13, color: "var(--color-muted)", margin: 0 }}>
                    <i className="fa-solid fa-info-circle" style={{ marginRight: 6 }}></i>
                    Haritada tıklayarak konum seçebilirsiniz
                  </p>
                  <div className="map-layer-btns">
                    <button type="button" className={`layer-btn ${mapLayer === "street" ? "active" : ""}`} onClick={() => changeMapLayer("street")} title="Yol Görünümü">
                      <i className="fa-solid fa-road"></i> Yol
                    </button>
                    <button type="button" className={`layer-btn ${mapLayer === "satellite" ? "active" : ""}`} onClick={() => changeMapLayer("satellite")} title="Uydu Görünümü">
                      <i className="fa-solid fa-satellite"></i> Uydu
                    </button>
                    <button type="button" className={`layer-btn ${mapLayer === "hybrid" ? "active" : ""}`} onClick={() => changeMapLayer("hybrid")} title="Karma (Uydu + Etiketler)">
                      <i className="fa-solid fa-layer-group"></i> Karma
                    </button>
                  </div>
                </div>
                <div ref={mapRef} style={{ height: 400, borderRadius: 8, border: "1px solid var(--color-border)" }}></div>
              </div>
            </div>
          </div>

          {/* 7. SEO */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-body">
              <h3 className="card-title"><i className="fa-solid fa-search" style={{ marginRight: 8 }}></i>SEO (Opsiyonel)</h3>
              <p style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 12 }}>Boş bırakılırsa otomatik oluşturulur</p>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">SEO URL</label>
                  <input className="form-input" placeholder="ornek-ilan" value={formState.slug} onChange={(e) => handleChange("slug", e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Meta Başlık (maks 70)</label>
                  <input className="form-input" maxLength={70} value={formState.metaTitle} onChange={(e) => handleChange("metaTitle", e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn: "span 4" }}>
                  <label className="form-label">Meta Açıklama (maks 160)</label>
                  <textarea className="form-input" rows={2} maxLength={160} value={formState.metaDescription} onChange={(e) => handleChange("metaDescription", e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn: "span 4" }}>
                  <label className="form-label">Anahtar Kelimeler</label>
                  <input className="form-input" placeholder="kelime1, kelime2" value={formState.metaKeywords} onChange={(e) => handleChange("metaKeywords", e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          {formError && <div className="alert alert-error" style={{ marginBottom: 16 }}><i className="fa-solid fa-exclamation-circle" style={{ marginRight: 8 }}></i>{formError}</div>}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Link href="/admin/listings" className="btn btn-outline" style={{ padding: "12px 24px" }}>Vazgeç</Link>
            <button type="submit" className="btn" disabled={submitState === "saving"} style={{ padding: "12px 24px" }}>
              {submitState === "saving" ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }}></i>Kaydediliyor...</> : <><i className="fa-solid fa-save" style={{ marginRight: 8 }}></i>İlanı Kaydet</>}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .card-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
        .section-title { font-size: 14px; font-weight: 600; color: var(--color-primary); margin: 20px 0 12px 0; padding-bottom: 6px; border-bottom: 1px solid var(--color-border); }
        .section-title:first-of-type { margin-top: 0; }
        .form-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .btn-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px; }
        .attr-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .form-group { display: flex; flex-direction: column; gap: 4px; }
        .form-label { font-size: 12px; font-weight: 600; color: var(--color-text); }
        .form-input { padding: 8px 10px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 13px; width: 100%; }
        .form-input:focus { outline: none; border-color: var(--color-primary); }
        .form-input:disabled { background: #f5f5f5; }
        .form-checkbox { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; }
        .form-checkbox input { width: 16px; height: 16px; cursor: pointer; flex-shrink: 0; }
        .form-checkbox-sm { display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 12px; white-space: nowrap; }
        .form-checkbox-sm input { width: 14px; height: 14px; cursor: pointer; flex-shrink: 0; }
        .checkbox-list { display: flex; flex-wrap: wrap; gap: 4px 12px; }
        .multi-select { grid-column: span 4; }
        .alert-error { background: #fee2e2; border: 1px solid #ef4444; color: #dc2626; padding: 12px 16px; border-radius: 8px; }
        .btn-sm { padding: 8px 14px; font-size: 13px; }
        
        .drop-zone { border: 2px dashed var(--color-border); border-radius: 8px; padding: 32px; text-align: center; cursor: pointer; transition: all 0.2s; }
        .drop-zone:hover, .drop-zone.dragging { border-color: var(--color-primary); background: rgba(10, 78, 163, 0.05); }
        .drop-zone p { margin: 0; font-size: 14px; color: var(--color-text); }
        
        .image-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; }
        .image-item { position: relative; border-radius: 8px; overflow: hidden; cursor: pointer; border: 2px solid transparent; aspect-ratio: 1; }
        .image-item.cover { border-color: var(--color-primary); }
        .image-item img { width: 100%; height: 100%; object-fit: cover; }
        .cover-badge { position: absolute; bottom: 0; left: 0; right: 0; background: var(--color-primary); color: #fff; font-size: 10px; text-align: center; padding: 2px; }
        .remove-btn { position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; border-radius: 50%; background: rgba(0,0,0,0.6); color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 10px; }
        .remove-btn:hover { background: #ef4444; }
        
        .video-upload-area { background: #f9fafb; border-radius: 8px; padding: 16px; }
        .video-drop-zone { border: 2px dashed var(--color-border); border-radius: 8px; padding: 24px; text-align: center; cursor: pointer; transition: all 0.2s; }
        .video-drop-zone:hover { border-color: var(--color-primary); background: rgba(10, 78, 163, 0.05); }
        .video-drop-zone p { margin: 0; font-size: 13px; color: var(--color-text); }
        
        .virtual-tour-area { background: #f9fafb; border-radius: 8px; padding: 16px; }
        
        .map-layer-btns { display: flex; gap: 4px; }
        .layer-btn { padding: 6px 10px; font-size: 11px; border: 1px solid var(--color-border); background: #fff; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s; }
        .layer-btn:hover { border-color: var(--color-primary); }
        .layer-btn.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
        
        @media (max-width: 900px) {
          .form-grid, .attr-grid { grid-template-columns: repeat(2, 1fr); }
          .form-group[style*="span 4"] { grid-column: span 2; }
          .multi-select { grid-column: span 2; }
        }
        @media (max-width: 600px) {
          .form-grid, .attr-grid { grid-template-columns: 1fr; }
          .form-group[style*="span 4"], .form-group[style*="span 2"] { grid-column: span 1; }
          .multi-select { grid-column: span 1; }
        }
      `}</style>
    </main>
  );
}
