type ListingLike = {
  attributes?: Record<string, unknown> | null;
  areaNet?: number | string | null;
  areaGross?: number | string | null;
  propertyType?: string | null;
};

// İlan kartı için özellik tipi
export type ListingFeature = {
  icon: string;
  value: string;
  title: string;
};

// İlan kartı için listing tipi
export type ListingForFeatures = {
  category?: string | null;
  subPropertyType?: string | null;
  roomCount?: string | number | null;
  floor?: string | number | null;
  totalFloors?: string | number | null;
  buildingAge?: string | number | null;
  areaGross?: number | string | null;
  facade?: string | null;
  hasGarage?: boolean | string | null;
  hasParentBathroom?: boolean | string | null;
  hasElevator?: boolean | string | null;
  isSiteInside?: boolean | string | null;
  furnished?: string | null;
  parkingType?: string | null;
  isSwapEligible?: boolean | string | null;
  shareStatus?: string | null;
  waterType?: string | null;
  hasElectricity?: boolean | string | null;
  hasRoadAccess?: boolean | string | null;
  hasHouse?: boolean | string | null;
  attributes?: Record<string, unknown> | null;
};

// Tüm sayfalarda kullanılacak ortak ilan kartı özellikleri fonksiyonu
export function getListingFeatures(listing: ListingForFeatures): ListingFeature[] {
  const features: ListingFeature[] = [];
  const category = listing.category;
  const attrs = (listing.attributes || {}) as Record<string, unknown>;

  // Helper: "Var", "Evet", true gibi değerleri kontrol et
  const isYes = (val: unknown): boolean => {
    if (val === true) return true;
    if (typeof val === "string") {
      const lower = val.toLowerCase();
      return lower === "var" || lower === "evet" || lower === "true";
    }
    return false;
  };

  // Helper: "Yok", "Hayır", false gibi değerleri kontrol et
  const isNo = (val: unknown): boolean => {
    if (val === false || val === null || val === undefined) return true;
    if (typeof val === "string") {
      const lower = val.toLowerCase();
      return lower === "yok" || lower === "hayır" || lower === "false" || lower === "";
    }
    return false;
  };

  // KONUT: Oda, Kat/Toplam Kat, Bina Yaşı, m², Cephe, Garaj, E.Banyo, Asansör, Site, Eşyalı, Otopark, Takas
  if (category === "HOUSING") {
    // Oda sayısı - öncelikli olarak gösterilmeli
    const rooms = listing.roomCount || attrs.roomCount || attrs.rooms;
    if (rooms) {
      features.push({ icon: "fa-door-open", value: String(rooms), title: "Oda Sayısı" });
    }
    // Kat / Toplam Kat
    const floor = listing.floor || attrs.floor || attrs.floorLocation;
    const totalFloors = listing.totalFloors || attrs.totalFloors;
    if (floor && totalFloors) {
      features.push({ icon: "fa-building", value: `${floor}/${totalFloors}`, title: "Kat" });
    } else if (floor) {
      features.push({ icon: "fa-building", value: String(floor), title: "Kat" });
    }
    // Bina Yaşı
    const buildingAge = listing.buildingAge || attrs.buildingAge;
    if (buildingAge) {
      const age = String(buildingAge);
      const ageDisplay = /^\d+$/.test(age) ? `${age} yıllık` : age;
      features.push({ icon: "fa-calendar", value: ageDisplay, title: "Bina Yaşı" });
    }
    // m²
    if (listing.areaGross) {
      features.push({ icon: "fa-ruler-combined", value: `${listing.areaGross} m²`, title: "Alan" });
    }
    // Cephe
    const facade = listing.facade || attrs.facade;
    if (facade && !isNo(facade)) {
      features.push({ icon: "fa-compass", value: String(facade), title: "Cephe" });
    }
    // Garaj
    const garage = listing.hasGarage || attrs.garage || attrs.hasGarage;
    if (garage && !isNo(garage)) {
      features.push({ icon: "fa-warehouse", value: "Garaj", title: "Garaj" });
    }
    // Ebeveyn Banyosu
    const parentBath = listing.hasParentBathroom || attrs.parentBathroom || attrs.hasParentBathroom;
    if (parentBath && !isNo(parentBath)) {
      features.push({ icon: "fa-bath", value: "E.Banyo", title: "Ebeveyn Banyosu" });
    }
    // Asansör
    const elevator = listing.hasElevator || attrs.elevator || attrs.hasElevator;
    if (elevator && !isNo(elevator)) {
      features.push({ icon: "fa-elevator", value: "Asansör", title: "Asansör" });
    }
    // Site İçi
    const siteInside = listing.isSiteInside || attrs.siteInside || attrs.isSiteInside;
    if (siteInside && !isNo(siteInside)) {
      features.push({ icon: "fa-building-shield", value: "Site", title: "Site İçi" });
    }
    // Eşyalı
    const furnished = listing.furnished || attrs.furnished;
    if (furnished && !isNo(furnished) && furnished !== "Eşyasız") {
      features.push({ icon: "fa-couch", value: "Eşyalı", title: "Eşyalı" });
    }
    // Otopark
    const parking = listing.parkingType || attrs.parking || attrs.parkingType;
    if (parking && !isNo(parking)) {
      features.push({ icon: "fa-car", value: "Otopark", title: "Otopark" });
    }
    // Takas
    const swap = listing.isSwapEligible || attrs.swap || attrs.isSwapEligible;
    if (swap && !isNo(swap)) {
      features.push({ icon: "fa-arrows-rotate", value: "Takas", title: "Takas" });
    }
  }
  // ARSA: Arsa Tipi, m², Kat Karşılığı, KAKS, TAKS, Kat Adeti, İmar Durumu, Nizam, Takas, Hisseli
  else if (category === "LAND") {
    // Arsa Tipi
    const landType = listing.subPropertyType || attrs.landType;
    if (landType) {
      features.push({ icon: "fa-mountain-sun", value: String(landType), title: "Arsa Tipi" });
    }
    // m²
    if (listing.areaGross) {
      features.push({ icon: "fa-ruler-combined", value: `${listing.areaGross} m²`, title: "Alan" });
    }
    // Kat Karşılığı
    const paymentType = attrs.paymentType;
    if (paymentType === "KAT_KARSILIGI" || paymentType === "Kat Karşılığı") {
      features.push({ icon: "fa-handshake", value: "Kat Karş.", title: "Kat Karşılığı" });
    }
    // KAKS
    if (attrs.kaks) {
      features.push({ icon: "fa-chart-line", value: `KAKS: ${attrs.kaks}`, title: "KAKS" });
    }
    // TAKS
    if (attrs.taks) {
      features.push({ icon: "fa-chart-area", value: `TAKS: ${attrs.taks}`, title: "TAKS" });
    }
    // Kat Adeti
    const floorCount = attrs.floorCount || attrs.totalFloors || listing.totalFloors;
    if (floorCount) {
      features.push({ icon: "fa-layer-group", value: `${floorCount} Kat`, title: "Kat Adeti" });
    }
    // İmar Durumu
    if (attrs.zoningStatus) {
      features.push({ icon: "fa-map", value: String(attrs.zoningStatus), title: "İmar Durumu" });
    }
    // Nizam
    const nizam = attrs.buildingOrder || attrs.nizam;
    if (nizam) {
      features.push({ icon: "fa-building-columns", value: String(nizam), title: "Nizam" });
    }
    // Takas
    const swap = listing.isSwapEligible || attrs.swap || attrs.isSwapEligible;
    if (swap && !isNo(swap)) {
      features.push({ icon: "fa-arrows-rotate", value: "Takas", title: "Takas" });
    }
    // Hisseli
    const shareStatus = listing.shareStatus || attrs.shareStatus;
    if (shareStatus === "HISSELI" || shareStatus === "Hisseli") {
      features.push({ icon: "fa-user-group", value: "Hisseli", title: "Hisse Durumu" });
    }
  }
  // TİCARİ: Ticari Tipi, m², Bina Yaşı, Kat Sayısı, Kiracılı, Takas, Hisseli
  else if (category === "COMMERCIAL") {
    // Ticari Tipi
    const commercialType = listing.subPropertyType || attrs.commercialType;
    if (commercialType) {
      features.push({ icon: "fa-store", value: String(commercialType), title: "Tip" });
    }
    // m²
    if (listing.areaGross) {
      features.push({ icon: "fa-ruler-combined", value: `${listing.areaGross} m²`, title: "Alan" });
    }
    // Bina Yaşı
    const buildingAge = listing.buildingAge || attrs.buildingAge;
    if (buildingAge) {
      const age = String(buildingAge);
      const ageDisplay = /^\d+$/.test(age) ? `${age} yıllık` : age;
      features.push({ icon: "fa-calendar", value: ageDisplay, title: "Bina Yaşı" });
    }
    // Kat Sayısı
    const totalFloors = listing.totalFloors || attrs.totalFloors || attrs.floorCount;
    if (totalFloors) {
      features.push({ icon: "fa-building", value: `${totalFloors} Kat`, title: "Kat" });
    }
    // Kiracılı
    const tenant = attrs.tenantStatus || attrs.hasTenant;
    if (tenant && (tenant === "Var" || tenant === "Kiracılı" || tenant === true)) {
      features.push({ icon: "fa-user-tie", value: "Kiracılı", title: "Kiracı Durumu" });
    }
    // Takas
    const swap = listing.isSwapEligible || attrs.swap || attrs.isSwapEligible;
    if (swap && !isNo(swap)) {
      features.push({ icon: "fa-arrows-rotate", value: "Takas", title: "Takas" });
    }
    // Hisseli
    const shareStatus = listing.shareStatus || attrs.shareStatus;
    if (shareStatus === "HISSELI" || shareStatus === "Hisseli") {
      features.push({ icon: "fa-user-group", value: "Hisseli", title: "Hisse Durumu" });
    }
  }
  // DEVREN: Ticari Tipi, m², Bina Yaşı, Kat Sayısı, Takas
  else if (category === "TRANSFER") {
    // Ticari Tipi
    const commercialType = listing.subPropertyType || attrs.commercialType;
    if (commercialType) {
      features.push({ icon: "fa-store", value: String(commercialType), title: "Tip" });
    }
    // m²
    if (listing.areaGross) {
      features.push({ icon: "fa-ruler-combined", value: `${listing.areaGross} m²`, title: "Alan" });
    }
    // Bina Yaşı
    const buildingAge = listing.buildingAge || attrs.buildingAge;
    if (buildingAge) {
      const age = String(buildingAge);
      const ageDisplay = /^\d+$/.test(age) ? `${age} yıllık` : age;
      features.push({ icon: "fa-calendar", value: ageDisplay, title: "Bina Yaşı" });
    }
    // Kat Sayısı
    const totalFloors = listing.totalFloors || attrs.totalFloors || attrs.floorCount;
    if (totalFloors) {
      features.push({ icon: "fa-building", value: `${totalFloors} Kat`, title: "Kat" });
    }
    // Takas
    const swap = listing.isSwapEligible || attrs.swap || attrs.isSwapEligible;
    if (swap && !isNo(swap)) {
      features.push({ icon: "fa-arrows-rotate", value: "Takas", title: "Takas" });
    }
  }
  // TARLA: Tarla Tipi, m², Su, Elektrik, Yol, Takas, Hisseli
  else if (category === "FIELD") {
    // Tarla Tipi
    const fieldType = listing.subPropertyType || attrs.fieldType;
    if (fieldType) {
      features.push({ icon: "fa-wheat-awn", value: String(fieldType), title: "Tarla Tipi" });
    }
    // m²
    if (listing.areaGross) {
      features.push({ icon: "fa-ruler-combined", value: `${listing.areaGross} m²`, title: "Alan" });
    }
    // Su
    const water = listing.waterType || attrs.waterType || attrs.waterStatus;
    if (water && !isNo(water)) {
      features.push({ icon: "fa-droplet", value: String(water), title: "Su" });
    }
    // Elektrik
    const electricity = listing.hasElectricity || attrs.electricity || attrs.hasElectricity;
    if (electricity && !isNo(electricity)) {
      features.push({ icon: "fa-bolt", value: "Elektrik", title: "Elektrik" });
    }
    // Yol
    const road = listing.hasRoadAccess || attrs.roadAccess || attrs.hasRoadAccess;
    if (road && !isNo(road)) {
      features.push({ icon: "fa-road", value: "Yol", title: "Yol" });
    }
    // Takas
    const swap = listing.isSwapEligible || attrs.swap || attrs.isSwapEligible;
    if (swap && !isNo(swap)) {
      features.push({ icon: "fa-arrows-rotate", value: "Takas", title: "Takas" });
    }
    // Hisseli
    const shareStatus = listing.shareStatus || attrs.shareStatus;
    if (shareStatus === "HISSELI" || shareStatus === "Hisseli") {
      features.push({ icon: "fa-user-group", value: "Hisseli", title: "Hisse Durumu" });
    }
  }
  // BAHÇE: Bahçe Tipi, m², Meyve Cinsi, Ağaç Sayısı, Ağaç Yaşı, Su, Elektrik, Ev, Takas, Hisseli
  else if (category === "GARDEN") {
    // Bahçe Tipi
    const gardenType = listing.subPropertyType || attrs.gardenType;
    if (gardenType) {
      features.push({ icon: "fa-tree", value: String(gardenType), title: "Bahçe Tipi" });
    }
    // m²
    if (listing.areaGross) {
      features.push({ icon: "fa-ruler-combined", value: `${listing.areaGross} m²`, title: "Alan" });
    }
    // Meyve Cinsi
    if (attrs.fruitType) {
      features.push({ icon: "fa-apple-whole", value: String(attrs.fruitType), title: "Meyve Cinsi" });
    }
    // Ağaç Sayısı
    if (attrs.treeCount) {
      features.push({ icon: "fa-seedling", value: `${attrs.treeCount} Ağaç`, title: "Ağaç Sayısı" });
    }
    // Ağaç Yaşı
    if (attrs.treeAge) {
      features.push({ icon: "fa-hourglass-half", value: `${attrs.treeAge} Yaş`, title: "Ağaç Yaşı" });
    }
    // Su
    const water = listing.waterType || attrs.waterType || attrs.waterStatus;
    if (water && !isNo(water)) {
      features.push({ icon: "fa-droplet", value: String(water), title: "Su" });
    }
    // Elektrik
    const electricity = listing.hasElectricity || attrs.electricity || attrs.hasElectricity;
    if (electricity && !isNo(electricity)) {
      features.push({ icon: "fa-bolt", value: "Elektrik", title: "Elektrik" });
    }
    // Ev
    const house = listing.hasHouse || attrs.house || attrs.hasHouse;
    if (house && !isNo(house)) {
      features.push({ icon: "fa-house", value: "Ev Var", title: "Ev" });
    }
    // Takas
    const swap = listing.isSwapEligible || attrs.swap || attrs.isSwapEligible;
    if (swap && !isNo(swap)) {
      features.push({ icon: "fa-arrows-rotate", value: "Takas", title: "Takas" });
    }
    // Hisseli
    const shareStatus = listing.shareStatus || attrs.shareStatus;
    if (shareStatus === "HISSELI" || shareStatus === "Hisseli") {
      features.push({ icon: "fa-user-group", value: "Hisseli", title: "Hisse Durumu" });
    }
  }
  // HOBİ BAHÇESİ: m², Su, Elektrik, Ağaç Sayısı, Yol, Ev, Takas, Hisseli
  else if (category === "HOBBY_GARDEN") {
    // m²
    if (listing.areaGross) {
      features.push({ icon: "fa-ruler-combined", value: `${listing.areaGross} m²`, title: "Alan" });
    }
    // Su
    const water = listing.waterType || attrs.waterType || attrs.waterStatus;
    if (water && !isNo(water)) {
      features.push({ icon: "fa-droplet", value: String(water), title: "Su" });
    }
    // Elektrik
    const electricity = listing.hasElectricity || attrs.electricity || attrs.hasElectricity;
    if (electricity && !isNo(electricity)) {
      features.push({ icon: "fa-bolt", value: "Elektrik", title: "Elektrik" });
    }
    // Ağaç Sayısı
    if (attrs.treeCount) {
      features.push({ icon: "fa-seedling", value: `${attrs.treeCount} Ağaç`, title: "Ağaç Sayısı" });
    }
    // Yol
    const road = listing.hasRoadAccess || attrs.roadAccess || attrs.hasRoadAccess;
    if (road && !isNo(road)) {
      features.push({ icon: "fa-road", value: "Yol", title: "Yol" });
    }
    // Ev
    const house = listing.hasHouse || attrs.house || attrs.hasHouse;
    if (house && !isNo(house)) {
      features.push({ icon: "fa-house", value: "Ev Var", title: "Ev" });
    }
    // Takas
    const swap = listing.isSwapEligible || attrs.swap || attrs.isSwapEligible;
    if (swap && !isNo(swap)) {
      features.push({ icon: "fa-arrows-rotate", value: "Takas", title: "Takas" });
    }
    // Hisseli
    const shareStatus = listing.shareStatus || attrs.shareStatus;
    if (shareStatus === "HISSELI" || shareStatus === "Hisseli") {
      features.push({ icon: "fa-user-group", value: "Hisseli", title: "Hisse Durumu" });
    }
  }
  // Bilinmeyen kategori - genel özellikler
  else {
    // Oda sayısı - önce göster
    const rooms = listing.roomCount || attrs.roomCount || attrs.rooms;
    if (rooms) {
      features.push({ icon: "fa-door-open", value: String(rooms), title: "Oda Sayısı" });
    }
    if (listing.areaGross) {
      features.push({ icon: "fa-ruler-combined", value: `${listing.areaGross} m²`, title: "Alan" });
    }
  }

  return features;
}

export function formatPrice(value?: number | string | null) {
  if (value === null || value === undefined) {
    return "";
  }

  const numericValue = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return `${new Intl.NumberFormat("tr-TR").format(numericValue)} TL`;
}

export function getStatusLabel(status?: string | null) {
  if (status === "FOR_RENT") {
    return "Kiralık";
  }
  if (status === "FOR_SALE") {
    return "Satılık";
  }
  return "İlan";
}

export function getStatusClass(status?: string | null) {
  return status === "FOR_RENT" ? "rent" : "sale";
}

export function buildListingFeatures(listing: ListingLike) {
  const attributes = listing.attributes ?? {};
  const rooms = typeof attributes.rooms === "string" ? attributes.rooms : null;

  return [
    rooms,
    listing.areaNet ? `${listing.areaNet} m² (Net)` : null,
    listing.areaGross ? `${listing.areaGross} m² (Brüt)` : null,
    listing.propertyType ?? null,
  ].filter(Boolean) as string[];
}

export function resolveImageUrl(url?: string | null) {
  if (!url) {
    return null;
  }

  if (url.startsWith("http")) {
    return url;
  }

  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  return `${base}${url}`;
}
