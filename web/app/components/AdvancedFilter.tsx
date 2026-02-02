"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Fiyat formatlama: 1000000 -> 1.000.000
function formatPriceInput(value: string): string {
  const numbers = value.replace(/\D/g, "");
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Fiyat parse: 1.000.000 -> 1000000
function parsePriceInput(value: string): string {
  return value.replace(/\./g, "");
}

type ListingStatus = "FOR_SALE" | "FOR_RENT";
type Category = "HOUSING" | "LAND" | "COMMERCIAL" | "FIELD" | "GARDEN" | "TRANSFER";

interface AdvancedFilterState {
  status: ListingStatus | null;
  category: Category | null;
  subPropertyType: string | null;
  
  // Fiyat
  minPrice: string;
  maxPrice: string;
  
  // Alan
  minArea: string;
  maxArea: string;
  
  // Konut özellikleri
  roomCount: string[];
  buildingAge: string | null;
  floor: string | null;
  totalFloors: string | null;
  floorType: string | null;
  apartmentsPerFloor: string | null;
  heatingType: string | null;
  furnished: boolean | null;
  facade: string | null;
  
  // Banyo/Tuvalet/Balkon
  bathroomCount: string | null;
  toiletCount: string | null;
  balconyCount: string | null;
  hasParentBathroom: boolean | null;
  hasGlassBalcony: boolean | null;
  
  // Ek özellikler
  hasElevator: boolean | null;
  hasGarage: boolean | null;
  hasStorage: boolean | null;
  hasDressingRoom: boolean | null;
  hasKitchenette: boolean | null;
  parkingType: string | null;
  
  // Site/Güvenlik
  isSiteInside: boolean | null;
  hasSecurity: boolean | null;
  
  // Yalıtım
  hasHeatInsulation: boolean | null;
  
  // Durum bilgileri
  isCreditEligible: boolean | null;
  usageStatus: string | null;
  deedStatus: string | null;
  shareStatus: string | null;
  hasOccupancyPermit: boolean | null;
  isSwapEligible: boolean | null;
  
  // Arsa özellikleri (sadece arsa için ödeme şekli)
  landType: string | null;
  paymentType: string | null;
  
  // Bahçe özellikleri
  gardenType: string | null;
  waterType: string | null;
  
  // Tarla özellikleri
  fieldType: string | null;
  
  // Tarla/Bahçe ek özellikler
  hasElectricity: boolean | null;
  hasHouse: boolean | null;
  hasRoadAccess: boolean | null;
  
  // Muhit özellikleri
  nearSchool: boolean | null;
  nearHospital: boolean | null;
  nearMarket: boolean | null;
  nearTransport: boolean | null;
  nearMosque: boolean | null;
  nearPark: boolean | null;
  nearSea: boolean | null;
  
  // Aktiviteler
  hasPool: boolean | null;
  hasGym: boolean | null;
  hasPlayground: boolean | null;
  hasSauna: boolean | null;
  hasTennisCourt: boolean | null;
  hasBasketballCourt: boolean | null;
  
  // Fırsat
  isOpportunity: boolean | null;
  
  // Konum
  cityId: string | null;
  districtId: string | null;
  neighborhoodIds: string[];
  
  // Sıralama
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface City {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
}

interface Neighborhood {
  id: string;
  name: string;
  district?: { id: string; name: string };
}

interface AdvancedFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Record<string, unknown>) => void;
  initialFilters?: Partial<AdvancedFilterState>;
  showCityFilter?: boolean;
  branchSlug?: string;
  branchCityId?: string;
  branchDistrictId?: string;
}

// Kategoriler
const CATEGORIES = {
  FOR_SALE: [
    { key: "HOUSING", label: "Konut", icon: "fa-house" },
    { key: "LAND", label: "Arsa", icon: "fa-mountain-sun" },
    { key: "COMMERCIAL", label: "Ticari", icon: "fa-store" },
    { key: "TRANSFER", label: "Devren", icon: "fa-handshake" },
    { key: "FIELD", label: "Tarla", icon: "fa-wheat-awn" },
    { key: "GARDEN", label: "Bahçe", icon: "fa-tree" },
  ],
  FOR_RENT: [
    { key: "HOUSING", label: "Konut", icon: "fa-house" },
    { key: "COMMERCIAL", label: "Ticari", icon: "fa-store" },
  ],
};

// Alt kategori tipleri
const SUB_PROPERTY_TYPES: Record<string, { value: string; label: string }[]> = {
  HOUSING: [
    { value: "DAIRE", label: "Daire" },
    { value: "APART", label: "Apart" },
    { value: "DUBLEX", label: "Dublex" },
    { value: "TRIPLEX", label: "Triplex" },
    { value: "VILLA", label: "Villa" },
    { value: "MUSTAKIL_EV", label: "Müstakil Ev" },
    { value: "DEVREMULK", label: "Devremülk" },
  ],
  LAND: [
    { value: "KONUT_ARSASI", label: "Konut Arsası" },
    { value: "TICARI_ARSA", label: "Ticari Arsa" },
    { value: "KONUT_TICARI_ARSA", label: "Konut + Ticari Arsa" },
    { value: "SANAYI_ARSASI", label: "Sanayi Arsası" },
    { value: "TURIZM_ARSASI", label: "Turizm Arsası" },
    { value: "AVM_ARSASI", label: "AVM Arsası" },
  ],
  COMMERCIAL: [
    { value: "DUKKAN", label: "Dükkan" },
    { value: "OFIS", label: "Ofis" },
    { value: "DEPO", label: "Depo" },
    { value: "SANAYI_DUKKANI", label: "Sanayi Dükkanı" },
    { value: "OTEL", label: "Otel" },
    { value: "FABRIKA", label: "Fabrika" },
  ],
  TRANSFER: [
    { value: "DUKKAN", label: "Dükkan" },
    { value: "OFIS", label: "Ofis" },
    { value: "DEPO", label: "Depo" },
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
    { value: "KARISIK", label: "Karışık" },
  ],
};

const ROOM_COUNTS = ["1+0", "1+1", "2+1", "3+1", "4+1", "5+1", "6+"];

const BUILDING_AGES = [
  { key: "0", label: "Sıfır Bina" },
  { key: "0-5", label: "1-5 Yıl" },
  { key: "5-10", label: "5-10 Yıl" },
  { key: "10-20", label: "10-20 Yıl" },
  { key: "20+", label: "20+ Yıl" },
];

const FLOORS = [
  { key: "BODRUM", label: "Bodrum" },
  { key: "ZEMIN", label: "Zemin Kat" },
  { key: "1", label: "1. Kat" },
  { key: "2", label: "2. Kat" },
  { key: "3", label: "3. Kat" },
  { key: "4", label: "4. Kat" },
  { key: "5", label: "5. Kat" },
  { key: "6+", label: "6+ Kat" },
  { key: "CATI", label: "Çatı Katı" },
];

const TOTAL_FLOORS = [
  { key: "1", label: "1 Katlı" },
  { key: "2", label: "2 Katlı" },
  { key: "3", label: "3 Katlı" },
  { key: "4", label: "4 Katlı" },
  { key: "5", label: "5 Katlı" },
  { key: "6-10", label: "6-10 Katlı" },
  { key: "10+", label: "10+ Katlı" },
];

const FLOOR_TYPES = [
  { key: "ARA_KAT", label: "Ara Kat" },
  { key: "BAHCE_KATI", label: "Bahçe Katı" },
  { key: "BODRUM_KAT", label: "Bodrum Kat" },
  { key: "CATI_DUBLEKS", label: "Çatı Dubleks" },
  { key: "CATI_KATI", label: "Çatı Katı" },
  { key: "GIRIS_KATI", label: "Giriş Katı" },
  { key: "KOT_1", label: "Kot 1" },
  { key: "KOT_2", label: "Kot 2" },
  { key: "KOT_3", label: "Kot 3" },
  { key: "MUSTAKIL_GIRIS", label: "Müstakil Giriş" },
  { key: "VILLA_TIPI", label: "Villa Tipi" },
  { key: "YARI_BODRUM", label: "Yarı Bodrum" },
  { key: "ZEMIN_KAT", label: "Zemin Kat" },
  { key: "YUKSEK_GIRIS", label: "Yüksek Giriş" },
];

const APARTMENTS_PER_FLOOR = [
  { key: "1", label: "1 Daire" },
  { key: "2", label: "2 Daire" },
  { key: "3", label: "3 Daire" },
  { key: "4", label: "4 Daire" },
  { key: "5+", label: "5+ Daire" },
];

const HEATING_TYPES = [
  { key: "DOGALGAZ_KOMBI", label: "Doğalgaz (Kombi)" },
  { key: "DOGALGAZ_MERKEZI", label: "Doğalgaz (Merkezi)" },
  { key: "MERKEZI_PAY_OLCER", label: "Merkezi (Pay Ölçer)" },
  { key: "SOBA", label: "Soba" },
  { key: "KLIMA", label: "Klima" },
  { key: "YERDEN_ISITMA", label: "Yerden Isıtma" },
  { key: "GUNES_ENERJISI", label: "Güneş Enerjisi" },
  { key: "YOK", label: "Yok" },
];

const FACADE_OPTIONS = [
  { key: "KUZEY", label: "Kuzey" },
  { key: "GUNEY", label: "Güney" },
  { key: "DOGU", label: "Doğu" },
  { key: "BATI", label: "Batı" },
  { key: "KUZEY_DOGU", label: "Kuzey-Doğu" },
  { key: "KUZEY_BATI", label: "Kuzey-Batı" },
  { key: "GUNEY_DOGU", label: "Güney-Doğu" },
  { key: "GUNEY_BATI", label: "Güney-Batı" },
];

const BATHROOM_COUNTS = [
  { key: "1", label: "1" },
  { key: "2", label: "2" },
  { key: "3", label: "3" },
  { key: "4+", label: "4+" },
];

const TOILET_COUNTS = [
  { key: "1", label: "1" },
  { key: "2", label: "2" },
  { key: "3+", label: "3+" },
];

const BALCONY_COUNTS = [
  { key: "0", label: "Yok" },
  { key: "1", label: "1" },
  { key: "2", label: "2" },
  { key: "3+", label: "3+" },
];

const PARKING_TYPES = [
  { key: "ACIK", label: "Açık Otopark" },
  { key: "KAPALI", label: "Kapalı Otopark" },
  { key: "YOL_UZERI", label: "Yol Üzeri" },
  { key: "YOK", label: "Yok" },
];

const USAGE_STATUS = [
  { key: "BOS", label: "Boş" },
  { key: "KIRACI_VAR", label: "Kiracılı" },
  { key: "MAL_SAHIBI", label: "Mal Sahibi Oturuyor" },
];

const DEED_STATUS = [
  { key: "KAT_MULKIYETI", label: "Kat Mülkiyetli" },
  { key: "KAT_IRTIFAKI", label: "Kat İrtifaklı" },
  { key: "HISSELI", label: "Hisseli Tapu" },
  { key: "TAPU_TAHSIS", label: "Tapu Tahsisli" },
  { key: "KOOPERATIF", label: "Kooperatif" },
];

const SHARE_STATUS = [
  { key: "TAM", label: "Tam Hisse" },
  { key: "HISSELI", label: "Hisseli" },
];

const PAYMENT_TYPES = [
  { key: "NAKIT", label: "Nakit" },
  { key: "KAT_KARSILIGI", label: "Kat Karşılığı" },
  { key: "TAKAS", label: "Takas" },
];

const WATER_TYPES = [
  { key: "SULU", label: "Sulu" },
  { key: "SUSUZ", label: "Susuz" },
  { key: "KUYU", label: "Kuyu Suyu" },
];

const SORT_OPTIONS = [
  { key: "createdAt-desc", label: "En Yeni" },
  { key: "createdAt-asc", label: "En Eski" },
  { key: "price-asc", label: "Fiyat (Artan)" },
  { key: "price-desc", label: "Fiyat (Azalan)" },
  { key: "areaGross-desc", label: "m² (Büyükten Küçüğe)" },
  { key: "areaGross-asc", label: "m² (Küçükten Büyüğe)" },
];

const defaultFilters: AdvancedFilterState = {
  status: null,
  category: null,
  subPropertyType: null,
  minPrice: "",
  maxPrice: "",
  minArea: "",
  maxArea: "",
  roomCount: [],
  buildingAge: null,
  floor: null,
  totalFloors: null,
  floorType: null,
  apartmentsPerFloor: null,
  heatingType: null,
  furnished: null,
  facade: null,
  bathroomCount: null,
  toiletCount: null,
  balconyCount: null,
  hasParentBathroom: null,
  hasGlassBalcony: null,
  hasElevator: null,
  hasGarage: null,
  hasStorage: null,
  hasDressingRoom: null,
  hasKitchenette: null,
  parkingType: null,
  isSiteInside: null,
  hasSecurity: null,
  hasHeatInsulation: null,
  isCreditEligible: null,
  usageStatus: null,
  deedStatus: null,
  shareStatus: null,
  hasOccupancyPermit: null,
  isSwapEligible: null,
  landType: null,
  paymentType: null,
  gardenType: null,
  waterType: null,
  fieldType: null,
  hasElectricity: null,
  hasHouse: null,
  hasRoadAccess: null,
  nearSchool: null,
  nearHospital: null,
  nearMarket: null,
  nearTransport: null,
  nearMosque: null,
  nearPark: null,
  nearSea: null,
  hasPool: null,
  hasGym: null,
  hasPlayground: null,
  hasSauna: null,
  hasTennisCourt: null,
  hasBasketballCourt: null,
  isOpportunity: null,
  cityId: null,
  districtId: null,
  neighborhoodIds: [],
  sortBy: "createdAt",
  sortOrder: "desc",
};

export default function AdvancedFilter({
  isOpen,
  onClose,
  onApply,
  initialFilters,
  showCityFilter = true,
  branchSlug,
  branchCityId,
  branchDistrictId,
}: AdvancedFilterProps) {
  const [filters, setFilters] = useState<AdvancedFilterState>({
    ...defaultFilters,
    ...initialFilters,
  });

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [showNeighborhoodModal, setShowNeighborhoodModal] = useState(false);
  const [neighborhoodSearch, setNeighborhoodSearch] = useState("");

  // Şehirleri yükle
  useEffect(() => {
    if (showCityFilter) {
      fetch(`${API_BASE_URL}/cities`)
        .then((res) => res.json())
        .then((data) => setCities(Array.isArray(data) ? data : []))
        .catch(() => setCities([]));
    }
  }, [showCityFilter]);

  // İlçeleri yükle
  const loadDistricts = useCallback(async (cityId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/districts?cityId=${cityId}`);
      const data = await res.json();
      setDistricts(Array.isArray(data) ? data : []);
    } catch {
      setDistricts([]);
    }
  }, []);

  // Mahalleleri yükle
  const loadNeighborhoods = useCallback(async (districtId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/neighborhoods?districtId=${districtId}`);
      const data = await res.json();
      setNeighborhoods(Array.isArray(data) ? data : []);
    } catch {
      setNeighborhoods([]);
    }
  }, []);

  // Şehir değişince ilçeleri yükle
  useEffect(() => {
    const cityId = filters.cityId || branchCityId;
    if (cityId) {
      loadDistricts(cityId);
    } else {
      setDistricts([]);
      setNeighborhoods([]);
    }
  }, [filters.cityId, branchCityId, loadDistricts]);

  // İlçe değişince mahalleleri yükle
  useEffect(() => {
    const districtId = filters.districtId || branchDistrictId;
    if (districtId) {
      loadNeighborhoods(districtId);
    } else {
      setNeighborhoods([]);
    }
  }, [filters.districtId, branchDistrictId, loadNeighborhoods]);

  const handleReset = () => {
    setFilters({
      ...defaultFilters,
      cityId: branchCityId || null,
      districtId: branchDistrictId || null,
    });
  };

  const handleApply = () => {
    const result: Record<string, unknown> = {};

    if (branchSlug) result.branchSlug = branchSlug;
    if (filters.status) result.status = filters.status;
    if (filters.category) result.category = filters.category;
    if (filters.subPropertyType) result.subPropertyType = filters.subPropertyType;
    if (filters.minPrice) result.minPrice = filters.minPrice;
    if (filters.maxPrice) result.maxPrice = filters.maxPrice;
    if (filters.minArea) result.minArea = filters.minArea;
    if (filters.maxArea) result.maxArea = filters.maxArea;
    if (filters.roomCount.length > 0) result.roomCount = filters.roomCount;
    if (filters.buildingAge) result.buildingAge = filters.buildingAge;
    if (filters.floor) result.floor = filters.floor;
    if (filters.totalFloors) result.totalFloors = filters.totalFloors;
    if (filters.floorType) result.floorType = filters.floorType;
    if (filters.apartmentsPerFloor) result.apartmentsPerFloor = filters.apartmentsPerFloor;
    if (filters.heatingType) result.heatingType = filters.heatingType;
    if (filters.furnished !== null) result.furnished = filters.furnished;
    if (filters.facade) result.facade = filters.facade;
    if (filters.bathroomCount) result.bathroomCount = filters.bathroomCount;
    if (filters.toiletCount) result.toiletCount = filters.toiletCount;
    if (filters.balconyCount) result.balconyCount = filters.balconyCount;
    if (filters.hasParentBathroom !== null) result.hasParentBathroom = filters.hasParentBathroom;
    if (filters.hasGlassBalcony !== null) result.hasGlassBalcony = filters.hasGlassBalcony;
    if (filters.hasElevator !== null) result.hasElevator = filters.hasElevator;
    if (filters.hasGarage !== null) result.hasGarage = filters.hasGarage;
    if (filters.hasStorage !== null) result.hasStorage = filters.hasStorage;
    if (filters.hasDressingRoom !== null) result.hasDressingRoom = filters.hasDressingRoom;
    if (filters.hasKitchenette !== null) result.hasKitchenette = filters.hasKitchenette;
    if (filters.parkingType) result.parkingType = filters.parkingType;
    if (filters.isSiteInside !== null) result.isSiteInside = filters.isSiteInside;
    if (filters.hasSecurity !== null) result.hasSecurity = filters.hasSecurity;
    if (filters.hasHeatInsulation !== null) result.hasHeatInsulation = filters.hasHeatInsulation;
    if (filters.isCreditEligible !== null) result.isCreditEligible = filters.isCreditEligible;
    if (filters.usageStatus) result.usageStatus = filters.usageStatus;
    if (filters.deedStatus) result.deedStatus = filters.deedStatus;
    if (filters.shareStatus) result.shareStatus = filters.shareStatus;
    if (filters.hasOccupancyPermit !== null) result.hasOccupancyPermit = filters.hasOccupancyPermit;
    if (filters.isSwapEligible !== null) result.isSwapEligible = filters.isSwapEligible;
    if (filters.landType) result.landType = filters.landType;
    if (filters.paymentType && filters.category === "LAND") result.paymentType = filters.paymentType;
    if (filters.gardenType) result.gardenType = filters.gardenType;
    if (filters.waterType) result.waterType = filters.waterType;
    if (filters.fieldType) result.fieldType = filters.fieldType;
    if (filters.hasElectricity !== null) result.hasElectricity = filters.hasElectricity;
    if (filters.hasHouse !== null) result.hasHouse = filters.hasHouse;
    if (filters.hasRoadAccess !== null) result.hasRoadAccess = filters.hasRoadAccess;
    if (filters.nearSchool !== null) result.nearSchool = filters.nearSchool;
    if (filters.nearHospital !== null) result.nearHospital = filters.nearHospital;
    if (filters.nearMarket !== null) result.nearMarket = filters.nearMarket;
    if (filters.nearTransport !== null) result.nearTransport = filters.nearTransport;
    if (filters.nearMosque !== null) result.nearMosque = filters.nearMosque;
    if (filters.nearPark !== null) result.nearPark = filters.nearPark;
    if (filters.nearSea !== null) result.nearSea = filters.nearSea;
    if (filters.hasPool !== null) result.hasPool = filters.hasPool;
    if (filters.hasGym !== null) result.hasGym = filters.hasGym;
    if (filters.hasPlayground !== null) result.hasPlayground = filters.hasPlayground;
    if (filters.hasSauna !== null) result.hasSauna = filters.hasSauna;
    if (filters.hasTennisCourt !== null) result.hasTennisCourt = filters.hasTennisCourt;
    if (filters.hasBasketballCourt !== null) result.hasBasketballCourt = filters.hasBasketballCourt;
    if (filters.isOpportunity !== null) result.isOpportunity = filters.isOpportunity;
    if (filters.cityId && showCityFilter) result.cityId = filters.cityId;
    if (filters.districtId) result.districtId = filters.districtId;
    if (filters.neighborhoodIds.length > 0) result.neighborhoodIds = filters.neighborhoodIds;
    result.sort = filters.sortBy;
    result.order = filters.sortOrder;

    onApply(result);
    onClose();
  };

  const toggleRoomCount = (room: string) => {
    setFilters((prev) => ({
      ...prev,
      roomCount: prev.roomCount.includes(room)
        ? prev.roomCount.filter((r) => r !== room)
        : [...prev.roomCount, room],
    }));
  };

  const toggleNeighborhood = (id: string) => {
    setFilters((prev) => ({
      ...prev,
      neighborhoodIds: prev.neighborhoodIds.includes(id)
        ? prev.neighborhoodIds.filter((n) => n !== id)
        : [...prev.neighborhoodIds, id],
    }));
  };

  const filteredNeighborhoods = neighborhoods.filter((n) =>
    n.name.toLowerCase().includes(neighborhoodSearch.toLowerCase())
  );

  // Kategorileri al
  const categories = filters.status ? CATEGORIES[filters.status] || [] : [];
  const subTypes = filters.category ? SUB_PROPERTY_TYPES[filters.category] || [] : [];
  const showHousingFilters = filters.category === "HOUSING";
  const showCommercialFilters = filters.category === "COMMERCIAL" || filters.category === "TRANSFER";
  const showLandFilters = filters.category === "LAND";
  const showGardenFilters = filters.category === "GARDEN";
  const showFieldFilters = filters.category === "FIELD";
  const showFieldOrGardenFilters = showFieldFilters || showGardenFilters;

  if (!isOpen) return null;

  return (
    <div className="advanced-filter-overlay" onClick={onClose}>
      <div className="advanced-filter-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="advanced-filter-header">
          <h2>
            <i className="fa-solid fa-sliders"></i>
            Detaylı Arama
          </h2>
          <button className="advanced-filter-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="advanced-filter-body">
          {/* Durum ve Kategori */}
          <div className="advanced-filter-section">
            <h3>İlan Türü</h3>
            <div className="advanced-filter-row">
              <div className="advanced-filter-group">
                <label>Durum</label>
                <div className="advanced-filter-chips">
                  <button
                    className={`filter-chip ${filters.status === "FOR_SALE" ? "active" : ""}`}
                    onClick={() => setFilters((p) => ({ ...p, status: "FOR_SALE", category: null, subPropertyType: null }))}
                  >
                    Satılık
                  </button>
                  <button
                    className={`filter-chip ${filters.status === "FOR_RENT" ? "active" : ""}`}
                    onClick={() => setFilters((p) => ({ ...p, status: "FOR_RENT", category: null, subPropertyType: null }))}
                  >
                    Kiralık
                  </button>
                </div>
              </div>
            </div>

            {filters.status && (
              <div className="advanced-filter-row">
                <div className="advanced-filter-group">
                  <label>Kategori</label>
                  <div className="advanced-filter-chips">
                    {categories.map((cat) => (
                      <button
                        key={cat.key}
                        className={`filter-chip ${filters.category === cat.key ? "active" : ""}`}
                        onClick={() => setFilters((p) => ({ ...p, category: cat.key as Category, subPropertyType: null }))}
                      >
                        <i className={`fa-solid ${cat.icon}`}></i>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {subTypes.length > 0 && (
              <div className="advanced-filter-row">
                <div className="advanced-filter-group">
                  <label>Alt Kategori</label>
                  <select
                    className="advanced-filter-select"
                    value={filters.subPropertyType || ""}
                    onChange={(e) => setFilters((p) => ({ ...p, subPropertyType: e.target.value || null }))}
                  >
                    <option value="">Tümü</option>
                    {subTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Fırsat ve Takas Filtresi */}
          <div className="advanced-filter-section">
            <h3>Özel Filtreler</h3>
            <div className="advanced-filter-row">
              <label className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.isOpportunity === true}
                  onChange={(e) => setFilters((p) => ({ ...p, isOpportunity: e.target.checked ? true : null }))}
                />
                <i className="fa-solid fa-star" style={{ color: "#10b981" }}></i>
                Sadece Fırsat İlanları
              </label>
              <label className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.isSwapEligible === true}
                  onChange={(e) => setFilters((p) => ({ ...p, isSwapEligible: e.target.checked ? true : null }))}
                />
                <i className="fa-solid fa-arrows-rotate" style={{ color: "#f59e0b" }}></i>
                Takas Yapılır
              </label>
            </div>
          </div>

          {/* Konut Özellikleri */}
          {showHousingFilters && (
            <>
              <div className="advanced-filter-section">
                <h3>Temel Bilgiler</h3>
                <div className="advanced-filter-row">
                  <div className="advanced-filter-group">
                    <label>Oda Sayısı</label>
                    <div className="advanced-filter-chips">
                      {ROOM_COUNTS.map((room) => (
                        <button
                          key={room}
                          className={`filter-chip ${filters.roomCount.includes(room) ? "active" : ""}`}
                          onClick={() => toggleRoomCount(room)}
                        >
                          {room}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="advanced-filter-row">
                  <div className="advanced-filter-group half">
                    <label>Bina Yaşı</label>
                    <select
                      className="advanced-filter-select"
                      value={filters.buildingAge || ""}
                      onChange={(e) => setFilters((p) => ({ ...p, buildingAge: e.target.value || null }))}
                    >
                      <option value="">Seçiniz</option>
                      {BUILDING_AGES.map((a) => (
                        <option key={a.key} value={a.key}>{a.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="advanced-filter-group half">
                    <label>Bulunduğu Kat</label>
                    <select
                      className="advanced-filter-select"
                      value={filters.floor || ""}
                      onChange={(e) => setFilters((p) => ({ ...p, floor: e.target.value || null }))}
                    >
                      <option value="">Seçiniz</option>
                      {FLOORS.map((f) => (
                        <option key={f.key} value={f.key}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="advanced-filter-row">
                  <div className="advanced-filter-group half">
                    <label>Bina Kat Sayısı</label>
                    <select
                      className="advanced-filter-select"
                      value={filters.totalFloors || ""}
                      onChange={(e) => setFilters((p) => ({ ...p, totalFloors: e.target.value || null }))}
                    >
                      <option value="">Seçiniz</option>
                      {TOTAL_FLOORS.map((f) => (
                        <option key={f.key} value={f.key}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="advanced-filter-group half">
                    <label>Kattaki Daire Sayısı</label>
                    <select
                      className="advanced-filter-select"
                      value={filters.apartmentsPerFloor || ""}
                      onChange={(e) => setFilters((p) => ({ ...p, apartmentsPerFloor: e.target.value || null }))}
                    >
                      <option value="">Seçiniz</option>
                      {APARTMENTS_PER_FLOOR.map((a) => (
                        <option key={a.key} value={a.key}>{a.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="advanced-filter-row">
                  <div className="advanced-filter-group half">
                    <label>Kat Tipi</label>
                    <select
                      className="advanced-filter-select"
                      value={filters.floorType || ""}
                      onChange={(e) => setFilters((p) => ({ ...p, floorType: e.target.value || null }))}
                    >
                      <option value="">Seçiniz</option>
                      {FLOOR_TYPES.map((f) => (
                        <option key={f.key} value={f.key}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="advanced-filter-group half">
                    <label>Cephe</label>
                    <select
                      className="advanced-filter-select"
                      value={filters.facade || ""}
                      onChange={(e) => setFilters((p) => ({ ...p, facade: e.target.value || null }))}
                    >
                      <option value="">Seçiniz</option>
                      {FACADE_OPTIONS.map((f) => (
                        <option key={f.key} value={f.key}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Fiyat ve Alan - Temel Bilgiler altında */}
              <div className="advanced-filter-section">
                <h3>Fiyat ve Alan</h3>
                <div className="advanced-filter-row">
                  <div className="advanced-filter-group half">
                    <label>Min Fiyat (₺)</label>
                    <input
                      type="text"
                      className="advanced-filter-input"
                      placeholder="0"
                      value={formatPriceInput(filters.minPrice)}
                      onChange={(e) => setFilters((p) => ({ ...p, minPrice: parsePriceInput(e.target.value) }))}
                    />
                  </div>
                  <div className="advanced-filter-group half">
                    <label>Max Fiyat (₺)</label>
                    <input
                      type="text"
                      className="advanced-filter-input"
                      placeholder="∞"
                      value={formatPriceInput(filters.maxPrice)}
                      onChange={(e) => setFilters((p) => ({ ...p, maxPrice: parsePriceInput(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="advanced-filter-row">
                  <div className="advanced-filter-group half">
                    <label>Min Alan (m²)</label>
                    <input
                      type="number"
                      className="advanced-filter-input"
                      placeholder="0"
                      value={filters.minArea}
                      onChange={(e) => setFilters((p) => ({ ...p, minArea: e.target.value }))}
                    />
                  </div>
                  <div className="advanced-filter-group half">
                    <label>Max Alan (m²)</label>
                    <input
                      type="number"
                      className="advanced-filter-input"
                      placeholder="∞"
                      value={filters.maxArea}
                      onChange={(e) => setFilters((p) => ({ ...p, maxArea: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="advanced-filter-section">
                <h3>Isıtma / Yalıtım</h3>
                <div className="advanced-filter-row">
                  <div className="advanced-filter-group half">
                    <label>Isıtma Tipi</label>
                    <select
                      className="advanced-filter-select"
                      value={filters.heatingType || ""}
                      onChange={(e) => setFilters((p) => ({ ...p, heatingType: e.target.value || null }))}
                    >
                      <option value="">Seçiniz</option>
                      {HEATING_TYPES.map((h) => (
                        <option key={h.key} value={h.key}>{h.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="advanced-filter-group half">
                    <label className="filter-checkbox-label" style={{ marginTop: 20 }}>
                      <input
                        type="checkbox"
                        checked={filters.hasHeatInsulation === true}
                        onChange={(e) => setFilters((p) => ({ ...p, hasHeatInsulation: e.target.checked ? true : null }))}
                      />
                      Isı Yalıtımlı
                    </label>
                  </div>
                </div>
              </div>

              <div className="advanced-filter-section">
                <h3>Banyo / Tuvalet / Balkon</h3>
                <div className="advanced-filter-row">
                  <div className="advanced-filter-group third">
                    <label>Banyo Sayısı</label>
                    <select
                      className="advanced-filter-select"
                      value={filters.bathroomCount || ""}
                      onChange={(e) => setFilters((p) => ({ ...p, bathroomCount: e.target.value || null }))}
                    >
                      <option value="">Seçiniz</option>
                      {BATHROOM_COUNTS.map((b) => (
                        <option key={b.key} value={b.key}>{b.label}</option>
                      ))}
                    </select>
                    {/* Ebeveyn Banyosu - Banyo Sayısı altında */}
                    <label className="filter-checkbox-label" style={{ marginTop: 10 }}>
                      <input
                        type="checkbox"
                        checked={filters.hasParentBathroom === true}
                        onChange={(e) => setFilters((p) => ({ ...p, hasParentBathroom: e.target.checked ? true : null }))}
                      />
                      Ebeveyn Banyosu
                    </label>
                  </div>
                  <div className="advanced-filter-group third">
                    <label>Tuvalet Sayısı</label>
                    <select
                      className="advanced-filter-select"
                      value={filters.toiletCount || ""}
                      onChange={(e) => setFilters((p) => ({ ...p, toiletCount: e.target.value || null }))}
                    >
                      <option value="">Seçiniz</option>
                      {TOILET_COUNTS.map((t) => (
                        <option key={t.key} value={t.key}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="advanced-filter-group third">
                    <label>Balkon Sayısı</label>
                    <select
                      className="advanced-filter-select"
                      value={filters.balconyCount || ""}
                      onChange={(e) => setFilters((p) => ({ ...p, balconyCount: e.target.value || null }))}
                    >
                      <option value="">Seçiniz</option>
                      {BALCONY_COUNTS.map((b) => (
                        <option key={b.key} value={b.key}>{b.label}</option>
                      ))}
                    </select>
                    {/* Cam Balkon - Balkon Sayısı altında */}
                    <label className="filter-checkbox-label" style={{ marginTop: 10 }}>
                      <input
                        type="checkbox"
                        checked={filters.hasGlassBalcony === true}
                        onChange={(e) => setFilters((p) => ({ ...p, hasGlassBalcony: e.target.checked ? true : null }))}
                      />
                      Cam Balkon
                    </label>
                  </div>
                </div>
              </div>

              <div className="advanced-filter-section">
                <h3>İç Özellikler</h3>
                <div className="advanced-filter-row">
                  <div className="advanced-filter-group half">
                    <label>Eşya Durumu</label>
                    <select
                      className="advanced-filter-select"
                      value={filters.furnished === null ? "" : filters.furnished ? "true" : "false"}
                      onChange={(e) => setFilters((p) => ({ ...p, furnished: e.target.value === "" ? null : e.target.value === "true" }))}
                    >
                      <option value="">Seçiniz</option>
                      <option value="true">Eşyalı</option>
                      <option value="false">Eşyasız</option>
                    </select>
                  </div>
                  <div className="advanced-filter-group half">
                    <label>Otopark</label>
                    <select
                      className="advanced-filter-select"
                      value={filters.parkingType || ""}
                      onChange={(e) => setFilters((p) => ({ ...p, parkingType: e.target.value || null }))}
                    >
                      <option value="">Seçiniz</option>
                      {PARKING_TYPES.map((p) => (
                        <option key={p.key} value={p.key}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="advanced-filter-row checkbox-row">
                  <label className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.hasElevator === true}
                      onChange={(e) => setFilters((p) => ({ ...p, hasElevator: e.target.checked ? true : null }))}
                    />
                    Asansör
                  </label>
                  <label className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.hasGarage === true}
                      onChange={(e) => setFilters((p) => ({ ...p, hasGarage: e.target.checked ? true : null }))}
                    />
                    Garaj
                  </label>
                  <label className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.hasStorage === true}
                      onChange={(e) => setFilters((p) => ({ ...p, hasStorage: e.target.checked ? true : null }))}
                    />
                    Kiler
                  </label>
                  <label className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.hasDressingRoom === true}
                      onChange={(e) => setFilters((p) => ({ ...p, hasDressingRoom: e.target.checked ? true : null }))}
                    />
                    Giyinme Odası
                  </label>
                  <label className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.hasKitchenette === true}
                      onChange={(e) => setFilters((p) => ({ ...p, hasKitchenette: e.target.checked ? true : null }))}
                    />
                    Kızartma Mutfağı
                  </label>
                </div>
              </div>

              <div className="advanced-filter-section">
                <h3>Site / Güvenlik</h3>
                <div className="advanced-filter-row checkbox-row">
                  <label className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.isSiteInside === true}
                      onChange={(e) => setFilters((p) => ({ ...p, isSiteInside: e.target.checked ? true : null }))}
                    />
                    Site İçinde
                  </label>
                  <label className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.hasSecurity === true}
                      onChange={(e) => setFilters((p) => ({ ...p, hasSecurity: e.target.checked ? true : null }))}
                    />
                    Güvenlik
                  </label>
                </div>
              </div>

              <div className="advanced-filter-section">
                <h3>Durum Bilgileri</h3>
                <div className="advanced-filter-row">
                  <div className="advanced-filter-group half">
                    <label>Kullanım Durumu</label>
                    <select
                      className="advanced-filter-select"
                      value={filters.usageStatus || ""}
                      onChange={(e) => setFilters((p) => ({ ...p, usageStatus: e.target.value || null }))}
                    >
                      <option value="">Seçiniz</option>
                      {USAGE_STATUS.map((u) => (
                        <option key={u.key} value={u.key}>{u.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="advanced-filter-group half">
                    <label>Tapu Durumu</label>
                    <select
                      className="advanced-filter-select"
                      value={filters.deedStatus || ""}
                      onChange={(e) => setFilters((p) => ({ ...p, deedStatus: e.target.value || null }))}
                    >
                      <option value="">Seçiniz</option>
                      {DEED_STATUS.map((d) => (
                        <option key={d.key} value={d.key}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="advanced-filter-row">
                  <div className="advanced-filter-group half">
                    <label>Hisse Durumu</label>
                    <select
                      className="advanced-filter-select"
                      value={filters.shareStatus || ""}
                      onChange={(e) => setFilters((p) => ({ ...p, shareStatus: e.target.value || null }))}
                    >
                      <option value="">Seçiniz</option>
                      {SHARE_STATUS.map((s) => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="advanced-filter-group half checkbox-row">
                    <label className="filter-checkbox-label" style={{ marginTop: 20 }}>
                      <input
                        type="checkbox"
                        checked={filters.hasOccupancyPermit === true}
                        onChange={(e) => setFilters((p) => ({ ...p, hasOccupancyPermit: e.target.checked ? true : null }))}
                      />
                      İskanlı
                    </label>
                    <label className="filter-checkbox-label" style={{ marginTop: 20 }}>
                      <input
                        type="checkbox"
                        checked={filters.isCreditEligible === true}
                        onChange={(e) => setFilters((p) => ({ ...p, isCreditEligible: e.target.checked ? true : null }))}
                      />
                      Krediye Uygun
                    </label>
                  </div>
                </div>
              </div>

              <div className="advanced-filter-section">
                <h3>Muhit</h3>
                <div className="advanced-filter-row checkbox-row">
                  <label className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.nearSchool === true}
                      onChange={(e) => setFilters((p) => ({ ...p, nearSchool: e.target.checked ? true : null }))}
                    />
                    Okula Yakın
                  </label>
                  <label className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.nearHospital === true}
                      onChange={(e) => setFilters((p) => ({ ...p, nearHospital: e.target.checked ? true : null }))}
                    />
                    Hastaneye Yakın
                  </label>
                  <label className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.nearMarket === true}
                      onChange={(e) => setFilters((p) => ({ ...p, nearMarket: e.target.checked ? true : null }))}
                    />
                    Markete Yakın
                  </label>
                  <label className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.nearTransport === true}
                      onChange={(e) => setFilters((p) => ({ ...p, nearTransport: e.target.checked ? true : null }))}
                    />
                    Toplu Taşımaya Yakın
                  </label>
                  <label className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.nearMosque === true}
                      onChange={(e) => setFilters((p) => ({ ...p, nearMosque: e.target.checked ? true : null }))}
                    />
                    Camiye Yakın
                  </label>
                  <label className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.nearPark === true}
                      onChange={(e) => setFilters((p) => ({ ...p, nearPark: e.target.checked ? true : null }))}
                    />
                    Parka Yakın
                  </label>
                  <label className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.nearSea === true}
                      onChange={(e) => setFilters((p) => ({ ...p, nearSea: e.target.checked ? true : null }))}
                    />
                    Denize Yakın
                  </label>
                </div>
              </div>

              <div className="advanced-filter-section">
                <h3>Aktiviteler</h3>
                <div className="advanced-filter-row checkbox-row">
                  <label className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.hasPool === true}
                      onChange={(e) => setFilters((p) => ({ ...p, hasPool: e.target.checked ? true : null }))}
                    />
                    Havuz
                  </label>
                  <label className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.hasGym === true}
                      onChange={(e) => setFilters((p) => ({ ...p, hasGym: e.target.checked ? true : null }))}
                    />
                    Spor Salonu
                  </label>
                  <label className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.hasPlayground === true}
                      onChange={(e) => setFilters((p) => ({ ...p, hasPlayground: e.target.checked ? true : null }))}
                    />
                    Çocuk Parkı
                  </label>
                  <label className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.hasSauna === true}
                      onChange={(e) => setFilters((p) => ({ ...p, hasSauna: e.target.checked ? true : null }))}
                    />
                    Sauna
                  </label>
                  <label className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.hasTennisCourt === true}
                      onChange={(e) => setFilters((p) => ({ ...p, hasTennisCourt: e.target.checked ? true : null }))}
                    />
                    Tenis Kortu
                  </label>
                  <label className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.hasBasketballCourt === true}
                      onChange={(e) => setFilters((p) => ({ ...p, hasBasketballCourt: e.target.checked ? true : null }))}
                    />
                    Basketbol Sahası
                  </label>
                </div>
              </div>
            </>
          )}

          {/* Ticari Özellikleri */}
          {showCommercialFilters && (
            <div className="advanced-filter-section">
              <h3>Ticari Özellikler</h3>
              <div className="advanced-filter-row">
                <div className="advanced-filter-group half">
                  <label>Bulunduğu Kat</label>
                  <select
                    className="advanced-filter-select"
                    value={filters.floor || ""}
                    onChange={(e) => setFilters((p) => ({ ...p, floor: e.target.value || null }))}
                  >
                    <option value="">Seçiniz</option>
                    {FLOORS.map((f) => (
                      <option key={f.key} value={f.key}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div className="advanced-filter-group half">
                  <label>Isıtma Tipi</label>
                  <select
                    className="advanced-filter-select"
                    value={filters.heatingType || ""}
                    onChange={(e) => setFilters((p) => ({ ...p, heatingType: e.target.value || null }))}
                  >
                    <option value="">Seçiniz</option>
                    {HEATING_TYPES.map((h) => (
                      <option key={h.key} value={h.key}>{h.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="advanced-filter-row checkbox-row">
                <label className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.isCreditEligible === true}
                    onChange={(e) => setFilters((p) => ({ ...p, isCreditEligible: e.target.checked ? true : null }))}
                  />
                  Krediye Uygun
                </label>
              </div>
            </div>
          )}

          {/* Arsa Özellikleri - sadece arsa için ödeme şekli */}
          {showLandFilters && (
            <div className="advanced-filter-section">
              <h3>Arsa Özellikleri</h3>
              <div className="advanced-filter-row">
                <div className="advanced-filter-group half">
                  <label>Ödeme Şekli</label>
                  <select
                    className="advanced-filter-select"
                    value={filters.paymentType || ""}
                    onChange={(e) => setFilters((p) => ({ ...p, paymentType: e.target.value || null }))}
                  >
                    <option value="">Seçiniz</option>
                    {PAYMENT_TYPES.map((p) => (
                      <option key={p.key} value={p.key}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div className="advanced-filter-group half">
                  <label className="filter-checkbox-label" style={{ marginTop: 20 }}>
                    <input
                      type="checkbox"
                      checked={filters.isCreditEligible === true}
                      onChange={(e) => setFilters((p) => ({ ...p, isCreditEligible: e.target.checked ? true : null }))}
                    />
                    Krediye Uygun
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Bahçe Özellikleri */}
          {showGardenFilters && (
            <div className="advanced-filter-section">
              <h3>Bahçe Özellikleri</h3>
              <div className="advanced-filter-row">
                <div className="advanced-filter-group half">
                  <label>Su Durumu</label>
                  <select
                    className="advanced-filter-select"
                    value={filters.waterType || ""}
                    onChange={(e) => setFilters((p) => ({ ...p, waterType: e.target.value || null }))}
                  >
                    <option value="">Seçiniz</option>
                    {WATER_TYPES.map((w) => (
                      <option key={w.key} value={w.key}>{w.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tarla Özellikleri */}
          {showFieldFilters && (
            <div className="advanced-filter-section">
              <h3>Tarla Özellikleri</h3>
              <div className="advanced-filter-row">
                <div className="advanced-filter-group half">
                  <label>Su Durumu</label>
                  <select
                    className="advanced-filter-select"
                    value={filters.waterType || ""}
                    onChange={(e) => setFilters((p) => ({ ...p, waterType: e.target.value || null }))}
                  >
                    <option value="">Seçiniz</option>
                    {WATER_TYPES.map((w) => (
                      <option key={w.key} value={w.key}>{w.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tarla/Bahçe ek özellikler */}
          {showFieldOrGardenFilters && (
            <div className="advanced-filter-section">
              <h3>Ek Özellikler</h3>
              <div className="advanced-filter-row checkbox-row">
                <label className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.hasElectricity === true}
                    onChange={(e) => setFilters((p) => ({ ...p, hasElectricity: e.target.checked ? true : null }))}
                  />
                  Elektrik Var
                </label>
                <label className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.hasHouse === true}
                    onChange={(e) => setFilters((p) => ({ ...p, hasHouse: e.target.checked ? true : null }))}
                  />
                  Ev Var
                </label>
                <label className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.hasRoadAccess === true}
                    onChange={(e) => setFilters((p) => ({ ...p, hasRoadAccess: e.target.checked ? true : null }))}
                  />
                  Yol Var
                </label>
              </div>
            </div>
          )}

          {/* Konum */}
          {showCityFilter && (
            <div className="advanced-filter-section">
              <h3>Konum</h3>
              <div className="advanced-filter-row">
                <div className="advanced-filter-group half">
                  <label>Şehir</label>
                  <select
                    className="advanced-filter-select"
                    value={filters.cityId || ""}
                    onChange={(e) => setFilters((p) => ({ ...p, cityId: e.target.value || null, districtId: null, neighborhoodIds: [] }))}
                  >
                    <option value="">Tüm Şehirler</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="advanced-filter-group half">
                  <label>İlçe</label>
                  <select
                    className="advanced-filter-select"
                    value={filters.districtId || ""}
                    onChange={(e) => setFilters((p) => ({ ...p, districtId: e.target.value || null, neighborhoodIds: [] }))}
                    disabled={!filters.cityId}
                  >
                    <option value="">Tüm İlçeler</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {filters.districtId && neighborhoods.length > 0 && (
                <div className="advanced-filter-row">
                  <div className="advanced-filter-group">
                    <label>Mahalleler ({filters.neighborhoodIds.length} seçili)</label>
                    <button
                      type="button"
                      className="advanced-filter-select-btn"
                      onClick={() => setShowNeighborhoodModal(true)}
                    >
                      <i className="fa-solid fa-map-location-dot"></i>
                      Mahalle Seç
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Şube bazlı mahalle seçimi */}
          {!showCityFilter && neighborhoods.length > 0 && (
            <div className="advanced-filter-section">
              <h3>Konum (Şube Bölgesi)</h3>
              <div className="advanced-filter-row">
                <div className="advanced-filter-group">
                  <label>Mahalleler ({filters.neighborhoodIds.length} seçili)</label>
                  <button
                    type="button"
                    className="advanced-filter-select-btn"
                    onClick={() => setShowNeighborhoodModal(true)}
                  >
                    <i className="fa-solid fa-map-location-dot"></i>
                    Mahalle Seç
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sıralama */}
          <div className="advanced-filter-section">
            <h3>Sıralama</h3>
            <div className="advanced-filter-row">
              <div className="advanced-filter-group">
                <select
                  className="advanced-filter-select"
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split("-");
                    setFilters((p) => ({ ...p, sortBy, sortOrder: sortOrder as "asc" | "desc" }));
                  }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="advanced-filter-footer">
          <button className="advanced-filter-reset" onClick={handleReset}>
            <i className="fa-solid fa-rotate-left"></i>
            Sıfırla
          </button>
          <button className="advanced-filter-apply" onClick={handleApply}>
            <i className="fa-solid fa-check"></i>
            Uygula
          </button>
        </div>

        {/* Mahalle Modal */}
        {showNeighborhoodModal && (
          <div className="advanced-filter-neighborhood-modal" onClick={() => setShowNeighborhoodModal(false)}>
            <div className="advanced-filter-neighborhood-content" onClick={(e) => e.stopPropagation()}>
              <div className="advanced-filter-neighborhood-header">
                <h3>Mahalle Seçimi</h3>
                <button onClick={() => setShowNeighborhoodModal(false)}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="advanced-filter-neighborhood-search">
                <i className="fa-solid fa-search"></i>
                <input
                  type="text"
                  placeholder="Mahalle ara..."
                  value={neighborhoodSearch}
                  onChange={(e) => setNeighborhoodSearch(e.target.value)}
                />
              </div>
              <div className="advanced-filter-neighborhood-actions">
                <button onClick={() => setFilters((p) => ({ ...p, neighborhoodIds: neighborhoods.map((n) => n.id) }))}>
                  Tümünü Seç
                </button>
                <button onClick={() => setFilters((p) => ({ ...p, neighborhoodIds: [] }))}>
                  Temizle
                </button>
              </div>
              <div className="advanced-filter-neighborhood-list">
                {filteredNeighborhoods.map((n) => (
                  <label key={n.id} className="advanced-filter-neighborhood-item">
                    <input
                      type="checkbox"
                      checked={filters.neighborhoodIds.includes(n.id)}
                      onChange={() => toggleNeighborhood(n.id)}
                    />
                    <span>{n.name}</span>
                  </label>
                ))}
              </div>
              <div className="advanced-filter-neighborhood-footer">
                <button onClick={() => setShowNeighborhoodModal(false)}>
                  Tamam ({filters.neighborhoodIds.length} seçili)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
