/**
 * İlan Özellikleri Seed Data
 * Tüm gayrimenkul kategorileri için dinamik özellik tanımları
 */

import { ListingStatus, ListingCategory, ListingAttributeType, PrismaClient } from '@prisma/client';

type AttributeDef = {
  status?: ListingStatus | null;
  category: ListingCategory;
  subPropertyType?: string | null;
  key: string;
  label: string;
  type: ListingAttributeType;
  options?: string[];
  allowsMultiple?: boolean;
  isRequired?: boolean;
  sortOrder: number;
  groupName?: string;
  placeholder?: string;
  suffix?: string;
  helpText?: string;
};

// ==========================================
// KONUT TİPLERİ
// ==========================================
export const HOUSING_TYPES = [
  'APART', 'DAIRE', 'DUBLEX', 'TRIPLEX', 'VILLA', 'MUSTAKIL_EV', 'DEVREMULK', 'DIGER'
];

export const HOUSING_TYPE_LABELS: Record<string, string> = {
  'APART': 'Apart',
  'DAIRE': 'Daire',
  'DUBLEX': 'Dublex',
  'TRIPLEX': 'Triplex',
  'VILLA': 'Villa',
  'MUSTAKIL_EV': 'Müstakil Ev',
  'DEVREMULK': 'Devremülk',
  'DIGER': 'Diğer'
};

// ==========================================
// ARSA TİPLERİ
// ==========================================
export const LAND_TYPES = [
  'KONUT_ARSASI', 'TICARI_ARSA', 'KONUT_TICARI_ARSA', 'OTEL_ARSASI', 'SANAYI_ARSASI', 'AVM_ARSASI', 'DIGER'
];

export const LAND_TYPE_LABELS: Record<string, string> = {
  'KONUT_ARSASI': 'Konut Arsası',
  'TICARI_ARSA': 'Ticari Arsa',
  'KONUT_TICARI_ARSA': 'Konut + Ticari Arsa',
  'OTEL_ARSASI': 'Otel Arsası',
  'SANAYI_ARSASI': 'Sanayi Arsası',
  'AVM_ARSASI': 'AVM Arsası',
  'DIGER': 'Diğer'
};

// ==========================================
// TİCARİ TİPLER
// ==========================================
export const COMMERCIAL_TYPES = [
  'DUKKAN', 'OFIS', 'DEPO', 'SANAYI_DUKKANI', 'OTEL', 'FABRIKA', 'DIGER'
];

export const COMMERCIAL_TYPE_LABELS: Record<string, string> = {
  'DUKKAN': 'Dükkan',
  'OFIS': 'Ofis',
  'DEPO': 'Depo',
  'SANAYI_DUKKANI': 'Sanayi Dükkanı',
  'OTEL': 'Otel',
  'FABRIKA': 'Fabrika',
  'DIGER': 'Diğer'
};

// ==========================================
// TARLA TİPLERİ
// ==========================================
export const FIELD_TYPES = [
  'SULU', 'KIRAC', 'VERIMLI', 'TASLIK', 'MARJINAL'
];

export const FIELD_TYPE_LABELS: Record<string, string> = {
  'SULU': 'Sulu',
  'KIRAC': 'Kıraç',
  'VERIMLI': 'Verimli',
  'TASLIK': 'Taşlık',
  'MARJINAL': 'Marjinal'
};

// ==========================================
// BAHÇE TİPLERİ
// ==========================================
export const GARDEN_TYPES = [
  'ELMA', 'CEVIZ', 'ZEYTIN', 'BADEM', 'ERIK', 'KIRAZ', 'UZUM_BAGI', 'KARISIK', 'DIGER'
];

export const GARDEN_TYPE_LABELS: Record<string, string> = {
  'ELMA': 'Elma Bahçesi',
  'CEVIZ': 'Ceviz Bahçesi',
  'ZEYTIN': 'Zeytin Bahçesi',
  'BADEM': 'Badem Bahçesi',
  'ERIK': 'Erik Bahçesi',
  'KIRAZ': 'Kiraz Bahçesi',
  'UZUM_BAGI': 'Üzüm Bağı',
  'KARISIK': 'Meyve Bahçesi (Karışık)',
  'DIGER': 'Diğer'
};

// ==========================================
// ORTAK SEÇENEKLER
// ==========================================
const ODA_SAYISI = ['1+0', '1+1', '2+0', '2+1', '3+1', '4+1', '5+1', '5+2', '6+1', '6+2', '6+3', '7+1', '7+2', '7+3', '7+4', '8+1', '8+2', '8+3', '8+4', 'Diğer'];
const BULUNDUGU_KAT = ['Zemin Kat', 'Yüksek Giriş', 'Dükkan Üstü', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', 'Bodrum Kat'];
const KAT_SAYISI = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25'];
const KATTAKI_DAIRE = ['Müstakil', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'];
const KAT_TIPI = ['Ara Kat', 'Zemin Kat', 'Yüksek Giriş', 'Çatı Katı', 'Bahçe Katı', 'Teras Kat', 'Bodrum Kat', 'Diğer'];
const CEPHE = ['Kuzey', 'Güney', 'Doğu', 'Batı'];
const BINA_YASI = ['Sıfır', 'İnşaat Hali', '1', '2', '3', '4', '5', '6-10 arası', '11-15 arası', '16-20 arası', '21-25 arası', '26-30 arası', '30 üstü'];
const BANYO_SAYISI = ['1', '2', '3', '4', '5'];
const VAR_YOK = ['Var', 'Yok'];
const TUVALET_TIPI = ['Alaturka', 'Alafranga'];
const ISITMA_TIPI = ['Bireysel Kombi', 'Doğalgaz (Merkezi)', 'Merkezi (Pay ölçer)', 'Yerden Isıtma', 'Sobalı', 'Elektrik', 'Klima'];
const ISI_YALITIM = ['Var', 'Yok', 'İçten', 'Dıştan', 'İçten ve Dıştan'];
const BALKON_SAYISI = ['Yok', '1', '2', '3', '4', '5', '6'];
const CAM_BALKON = ['Var', 'Yok', '1', '2', '3', '4', '5', '6'];
const ASANSOR = ['Var', 'Yok', 'Çift Asansör', 'Yapım Aşamasında'];
const IC_KAPILAR = ['Panel', 'Lake', 'Ahşap', 'Pvc', 'Metal', 'Diğer'];
const PENCERELER = ['Pvc', 'Ahşap', 'Metal', 'Diğer'];
const ZEMINLER = ['Laminant', 'Granit', 'Ahşap Parke', 'Fayans', 'Beton', 'Diğer'];
const MUTFAK_DOLABI = ['Sıfır', 'Yeni', 'İyi', 'Orta', 'Kötü', 'Yok'];
const KILER = ['Var', 'Yok', 'Dairede', 'Bodrumda', 'Çatıda', 'Balkonda', 'Bahçede'];
const GARAJ = ['Var', 'Yok', 'Bireysel Garaj', 'Ortak Kullanım'];
const BAHCE = ['Var', 'Yok', 'Bireysel', 'Ortak Kullanım', 'Kış Bahçeli'];
const OTOPARK = ['Var', 'Yok', 'Açık', 'Kapalı', 'Açık ve Kapalı'];
const PANJUR = ['Var', 'Yok', 'Otomatik Panjur', 'Manuel Panjur'];
const GUVENLIK = ['Var', 'Yok', 'Kamera Sistemi', 'Güvenlik'];
const AKTIVITE = ['Spa', 'Sauna', 'Hamam', 'Açık Havuz', 'Kapalı Havuz', 'Spor Salonu', 'Tenis Kortu', 'Basketbol Sahası', 'Futbol Sahası', 'Toplantı Salonu', 'Kreş'];
const MUHIT = ['Çarşı', 'İlkokul', 'Lise', 'Üniversite', 'Hastane', 'Sağlık Ocağı', 'Pazar', 'AVM', 'Market', 'Eczane', 'Belediye', 'Dolmuş Hattı', 'Otobüs Durağı', 'Ana Cadde', 'Ara Sokak'];
const TAPU_DURUMU = ['Kat Mülkiyeti', 'Kat İrtifakı', 'Arsa Tapulu'];
const ISKAN = ['Var', 'Yok', 'Alınacak'];
const KULLANIM_DURUMU = ['Mülk Sahibi', 'Boş', 'Kiracılı', 'Yapım Aşamasında'];
const TAKAS = ['Var', 'Yok', 'Değerlendirilir', 'Araç ile Takas', 'Daire ile Takas', 'Gayrimenkul ile Takas'];
const KREDIYE_UYGUN = ['Evet', 'Hayır', 'Kısmen'];
const HISSE_DURUMU = ['Hisseli', 'Müstakil'];
const EVET_HAYIR = ['Evet', 'Hayır'];

// Arsa/Tarla/Bahçe için
const IMAR_DURUMU = ['İmarlı', 'İmarsız', '18. Madde kapsamında', 'Diğer'];
const NIZAM = ['Ayrık', 'Bitişik', 'Blok', 'İkiz', 'Villa', 'Birlikte Yapılaşma', 'Diğer'];
const ALTYAPI = ['Elektrik', 'Su', 'Sanayi Elektriği', 'Doğalgaz', 'İnternet', 'Telekom', 'Fiber', 'Kanalizasyon', 'Yol'];
const SU_DURUMU = ['Var', 'Yok', 'Şebeke', 'Kooperatif', 'Sondaj Kuyu', 'Kanaldan Sulama', 'Dereden', 'Diğer'];
const ELEKTRIK_DURUMU = ['Var', 'Yok', 'Alınabilir'];
const YOL_DURUMU = ['Var', 'Yok', 'Patika Yol', 'Kadastro Yolu'];
const EV_TIPI = ['Var', 'Yok', '1+1', '2+1', '3+1', '4+1', '5+1', '6+1', 'Dublex', 'Triplex'];
const HAVUZ = ['Var', 'Yok', 'Sulama Havuzu', 'Yüzme Havuzu', 'Bilinmiyor'];

// Ticari için
const TICARI_KAT = ['Bodrum', 'Zemin', 'Asma Kat', '1', '2', '3', '4', '5', '6'];

// ==========================================
// SATILIK KONUT ÖZELLİKLERİ
// ==========================================
const SATILIK_KONUT_ATTRIBUTES: AttributeDef[] = [
  // Temel Bilgiler
  { status: 'FOR_SALE', category: 'HOUSING', key: 'roomCount', label: 'Oda Sayısı', type: 'SELECT', options: ODA_SAYISI, isRequired: true, sortOrder: 10, groupName: 'Temel Bilgiler' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'floorLocation', label: 'Bulunduğu Kat', type: 'SELECT', options: BULUNDUGU_KAT, sortOrder: 20, groupName: 'Temel Bilgiler' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'totalFloors', label: 'Kat Sayısı', type: 'SELECT', options: KAT_SAYISI, sortOrder: 30, groupName: 'Temel Bilgiler' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'unitsOnFloor', label: 'Kattaki Daire Sayısı', type: 'SELECT', options: KATTAKI_DAIRE, sortOrder: 40, groupName: 'Temel Bilgiler' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'floorType', label: 'Kat Tipi', type: 'SELECT', options: KAT_TIPI, sortOrder: 50, groupName: 'Temel Bilgiler' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'facing', label: 'Cephe', type: 'SELECT', options: CEPHE, allowsMultiple: true, sortOrder: 60, groupName: 'Temel Bilgiler' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'buildingAge', label: 'Bina Yaşı', type: 'SELECT', options: BINA_YASI, sortOrder: 70, groupName: 'Temel Bilgiler' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'areaGross', label: 'Brüt Metrekare', type: 'NUMBER', isRequired: true, sortOrder: 80, groupName: 'Temel Bilgiler', suffix: 'm²' },

  // Banyo/Tuvalet
  { status: 'FOR_SALE', category: 'HOUSING', key: 'bathroomCount', label: 'Banyo Sayısı', type: 'SELECT', options: BANYO_SAYISI, sortOrder: 100, groupName: 'Banyo/Tuvalet' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'masterBathroom', label: 'Ebeveyn Banyosu', type: 'SELECT', options: VAR_YOK, sortOrder: 110, groupName: 'Banyo/Tuvalet' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'toiletCount', label: 'Tuvalet Sayısı', type: 'SELECT', options: BANYO_SAYISI, sortOrder: 120, groupName: 'Banyo/Tuvalet' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'toiletType', label: 'Tuvalet Tipi', type: 'SELECT', options: TUVALET_TIPI, allowsMultiple: true, sortOrder: 130, groupName: 'Banyo/Tuvalet' },

  // Isıtma/Yalıtım
  { status: 'FOR_SALE', category: 'HOUSING', key: 'heatingType', label: 'Isıtma Tipi', type: 'SELECT', options: ISITMA_TIPI, allowsMultiple: true, sortOrder: 200, groupName: 'Isıtma/Yalıtım' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'insulation', label: 'Isı Yalıtım', type: 'SELECT', options: ISI_YALITIM, sortOrder: 210, groupName: 'Isıtma/Yalıtım' },

  // Balkon
  { status: 'FOR_SALE', category: 'HOUSING', key: 'balconyCount', label: 'Balkon Sayısı', type: 'SELECT', options: BALKON_SAYISI, sortOrder: 300, groupName: 'Balkon' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'glassBalcony', label: 'Cam Balkon', type: 'SELECT', options: CAM_BALKON, sortOrder: 310, groupName: 'Balkon' },

  // İç Özellikler
  { status: 'FOR_SALE', category: 'HOUSING', key: 'fryingKitchen', label: 'Kızartma Mutfağı', type: 'SELECT', options: VAR_YOK, sortOrder: 400, groupName: 'İç Özellikler' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'dressingRoom', label: 'Giyinme Odası', type: 'SELECT', options: VAR_YOK, sortOrder: 410, groupName: 'İç Özellikler' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'laundryRoom', label: 'Çamaşır Odası', type: 'SELECT', options: VAR_YOK, sortOrder: 420, groupName: 'İç Özellikler' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'elevator', label: 'Asansör', type: 'SELECT', options: ASANSOR, sortOrder: 430, groupName: 'İç Özellikler' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'interiorDoors', label: 'İç Kapılar', type: 'SELECT', options: IC_KAPILAR, sortOrder: 440, groupName: 'İç Özellikler' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'windows', label: 'Pencereler', type: 'SELECT', options: PENCERELER, sortOrder: 450, groupName: 'İç Özellikler' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'suspendedCeiling', label: 'Asma Tavan', type: 'SELECT', options: VAR_YOK, sortOrder: 460, groupName: 'İç Özellikler' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'showerCabin', label: 'Duşakabin', type: 'SELECT', options: VAR_YOK, sortOrder: 470, groupName: 'İç Özellikler' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'wardrobe', label: 'Vestiyer', type: 'SELECT', options: VAR_YOK, sortOrder: 480, groupName: 'İç Özellikler' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'roofCovering', label: 'Çatı Kaplama', type: 'SELECT', options: VAR_YOK, sortOrder: 490, groupName: 'İç Özellikler' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'flooring', label: 'Zeminler', type: 'SELECT', options: ZEMINLER, sortOrder: 500, groupName: 'İç Özellikler' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'kitchenCabinet', label: 'Mutfak Dolabı', type: 'SELECT', options: MUTFAK_DOLABI, sortOrder: 510, groupName: 'İç Özellikler' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'steelDoor', label: 'Çelik Kapı', type: 'SELECT', options: VAR_YOK, sortOrder: 520, groupName: 'İç Özellikler' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'pantry', label: 'Kiler', type: 'SELECT', options: KILER, allowsMultiple: true, sortOrder: 530, groupName: 'İç Özellikler' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'builtInAppliances', label: 'Ankastre', type: 'SELECT', options: VAR_YOK, sortOrder: 540, groupName: 'İç Özellikler' },

  // Dış Özellikler
  { status: 'FOR_SALE', category: 'HOUSING', key: 'garage', label: 'Garaj', type: 'SELECT', options: GARAJ, sortOrder: 600, groupName: 'Dış Özellikler' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'garden', label: 'Bahçe', type: 'SELECT', options: BAHCE, allowsMultiple: true, sortOrder: 610, groupName: 'Dış Özellikler' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'parking', label: 'Otopark', type: 'SELECT', options: OTOPARK, sortOrder: 620, groupName: 'Dış Özellikler' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'blinds', label: 'Panjur', type: 'SELECT', options: PANJUR, allowsMultiple: true, sortOrder: 630, groupName: 'Dış Özellikler' },

  // Site/Güvenlik
  { status: 'FOR_SALE', category: 'HOUSING', key: 'inComplex', label: 'Site İçi mi', type: 'SELECT', options: EVET_HAYIR, sortOrder: 700, groupName: 'Site/Güvenlik' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'playground', label: 'Oyun Parkı', type: 'SELECT', options: VAR_YOK, sortOrder: 710, groupName: 'Site/Güvenlik' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'gazebo', label: 'Kamelya', type: 'SELECT', options: VAR_YOK, sortOrder: 720, groupName: 'Site/Güvenlik' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'security', label: 'Güvenlik', type: 'SELECT', options: GUVENLIK, allowsMultiple: true, sortOrder: 730, groupName: 'Site/Güvenlik' },

  // Aktiviteler
  { status: 'FOR_SALE', category: 'HOUSING', key: 'activities', label: 'Aktivite', type: 'SELECT', options: AKTIVITE, allowsMultiple: true, sortOrder: 800, groupName: 'Aktiviteler' },

  // Muhit
  { status: 'FOR_SALE', category: 'HOUSING', key: 'neighborhood', label: 'Muhit', type: 'SELECT', options: MUHIT, allowsMultiple: true, sortOrder: 900, groupName: 'Muhit' },

  // Ödeme/Durum
  { status: 'FOR_SALE', category: 'HOUSING', key: 'dues', label: 'Aidat', type: 'TEXT', sortOrder: 1000, groupName: 'Ödeme/Durum', suffix: '₺' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'deedStatus', label: 'Tapu Durumu', type: 'SELECT', options: TAPU_DURUMU, sortOrder: 1010, groupName: 'Ödeme/Durum' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'occupancyPermit', label: 'İskan/Oturum', type: 'SELECT', options: ISKAN, sortOrder: 1020, groupName: 'Ödeme/Durum' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'usageStatus', label: 'Kullanım Durumu', type: 'SELECT', options: KULLANIM_DURUMU, sortOrder: 1030, groupName: 'Ödeme/Durum' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'rentalIncome', label: 'Kira Bedeli', type: 'TEXT', sortOrder: 1040, groupName: 'Ödeme/Durum', suffix: '₺', helpText: 'Kiracılıysa mevcut kira bedeli' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'exchange', label: 'Takas', type: 'SELECT', options: TAKAS, sortOrder: 1050, groupName: 'Ödeme/Durum' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'creditEligible', label: 'Krediye Uygun mu', type: 'SELECT', options: KREDIYE_UYGUN, sortOrder: 1060, groupName: 'Ödeme/Durum' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'furnished', label: 'Eşyalı mı', type: 'SELECT', options: EVET_HAYIR, sortOrder: 1070, groupName: 'Ödeme/Durum' },
  { status: 'FOR_SALE', category: 'HOUSING', key: 'shareStatus', label: 'Hisse Durumu', type: 'SELECT', options: HISSE_DURUMU, sortOrder: 1080, groupName: 'Ödeme/Durum' },
];

// ==========================================
// KİRALIK KONUT ÖZELLİKLERİ (Satılıktan farkları)
// ==========================================
const KIRALIK_KONUT_ATTRIBUTES: AttributeDef[] = [
  // Temel Bilgiler (Satılıkla aynı)
  { status: 'FOR_RENT', category: 'HOUSING', key: 'roomCount', label: 'Oda Sayısı', type: 'SELECT', options: ODA_SAYISI, isRequired: true, sortOrder: 10, groupName: 'Temel Bilgiler' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'floorLocation', label: 'Bulunduğu Kat', type: 'SELECT', options: BULUNDUGU_KAT, sortOrder: 20, groupName: 'Temel Bilgiler' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'totalFloors', label: 'Kat Sayısı', type: 'SELECT', options: KAT_SAYISI, sortOrder: 30, groupName: 'Temel Bilgiler' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'unitsOnFloor', label: 'Kattaki Daire Sayısı', type: 'SELECT', options: KATTAKI_DAIRE, sortOrder: 40, groupName: 'Temel Bilgiler' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'floorType', label: 'Kat Tipi', type: 'SELECT', options: KAT_TIPI, sortOrder: 50, groupName: 'Temel Bilgiler' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'facing', label: 'Cephe', type: 'SELECT', options: CEPHE, allowsMultiple: true, sortOrder: 60, groupName: 'Temel Bilgiler' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'buildingAge', label: 'Bina Yaşı', type: 'SELECT', options: BINA_YASI, sortOrder: 70, groupName: 'Temel Bilgiler' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'areaGross', label: 'Brüt Metrekare', type: 'NUMBER', isRequired: true, sortOrder: 80, groupName: 'Temel Bilgiler', suffix: 'm²' },
  
  // Banyo/Tuvalet
  { status: 'FOR_RENT', category: 'HOUSING', key: 'bathroomCount', label: 'Banyo Sayısı', type: 'SELECT', options: BANYO_SAYISI, sortOrder: 100, groupName: 'Banyo/Tuvalet' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'masterBathroom', label: 'Ebeveyn Banyosu', type: 'SELECT', options: VAR_YOK, sortOrder: 110, groupName: 'Banyo/Tuvalet' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'toiletCount', label: 'Tuvalet Sayısı', type: 'SELECT', options: BANYO_SAYISI, sortOrder: 120, groupName: 'Banyo/Tuvalet' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'toiletType', label: 'Tuvalet Tipi', type: 'SELECT', options: TUVALET_TIPI, allowsMultiple: true, sortOrder: 130, groupName: 'Banyo/Tuvalet' },

  // Isıtma/Yalıtım
  { status: 'FOR_RENT', category: 'HOUSING', key: 'heatingType', label: 'Isıtma Tipi', type: 'SELECT', options: ISITMA_TIPI, allowsMultiple: true, sortOrder: 200, groupName: 'Isıtma/Yalıtım' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'insulation', label: 'Isı Yalıtım', type: 'SELECT', options: ISI_YALITIM, sortOrder: 210, groupName: 'Isıtma/Yalıtım' },

  // Balkon
  { status: 'FOR_RENT', category: 'HOUSING', key: 'balconyCount', label: 'Balkon Sayısı', type: 'SELECT', options: BALKON_SAYISI, sortOrder: 300, groupName: 'Balkon' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'glassBalcony', label: 'Cam Balkon', type: 'SELECT', options: CAM_BALKON, sortOrder: 310, groupName: 'Balkon' },

  // İç Özellikler
  { status: 'FOR_RENT', category: 'HOUSING', key: 'fryingKitchen', label: 'Kızartma Mutfağı', type: 'SELECT', options: VAR_YOK, sortOrder: 400, groupName: 'İç Özellikler' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'dressingRoom', label: 'Giyinme Odası', type: 'SELECT', options: VAR_YOK, sortOrder: 410, groupName: 'İç Özellikler' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'laundryRoom', label: 'Çamaşır Odası', type: 'SELECT', options: VAR_YOK, sortOrder: 420, groupName: 'İç Özellikler' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'elevator', label: 'Asansör', type: 'SELECT', options: ASANSOR, sortOrder: 430, groupName: 'İç Özellikler' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'interiorDoors', label: 'İç Kapılar', type: 'SELECT', options: IC_KAPILAR, sortOrder: 440, groupName: 'İç Özellikler' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'windows', label: 'Pencereler', type: 'SELECT', options: PENCERELER, sortOrder: 450, groupName: 'İç Özellikler' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'suspendedCeiling', label: 'Asma Tavan', type: 'SELECT', options: VAR_YOK, sortOrder: 460, groupName: 'İç Özellikler' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'showerCabin', label: 'Duşakabin', type: 'SELECT', options: VAR_YOK, sortOrder: 470, groupName: 'İç Özellikler' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'wardrobe', label: 'Vestiyer', type: 'SELECT', options: VAR_YOK, sortOrder: 480, groupName: 'İç Özellikler' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'roofCovering', label: 'Çatı Kaplama', type: 'SELECT', options: VAR_YOK, sortOrder: 490, groupName: 'İç Özellikler' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'flooring', label: 'Zeminler', type: 'SELECT', options: ZEMINLER, sortOrder: 500, groupName: 'İç Özellikler' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'kitchenCabinet', label: 'Mutfak Dolabı', type: 'SELECT', options: MUTFAK_DOLABI, sortOrder: 510, groupName: 'İç Özellikler' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'steelDoor', label: 'Çelik Kapı', type: 'SELECT', options: VAR_YOK, sortOrder: 520, groupName: 'İç Özellikler' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'pantry', label: 'Kiler', type: 'SELECT', options: KILER, allowsMultiple: true, sortOrder: 530, groupName: 'İç Özellikler' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'builtInAppliances', label: 'Ankastre', type: 'SELECT', options: VAR_YOK, sortOrder: 540, groupName: 'İç Özellikler' },
  
  // Dış Özellikler
  { status: 'FOR_RENT', category: 'HOUSING', key: 'garage', label: 'Garaj', type: 'SELECT', options: GARAJ, sortOrder: 600, groupName: 'Dış Özellikler' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'garden', label: 'Bahçe', type: 'SELECT', options: BAHCE, allowsMultiple: true, sortOrder: 610, groupName: 'Dış Özellikler' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'parking', label: 'Otopark', type: 'SELECT', options: OTOPARK, sortOrder: 620, groupName: 'Dış Özellikler' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'blinds', label: 'Panjur', type: 'SELECT', options: PANJUR, allowsMultiple: true, sortOrder: 630, groupName: 'Dış Özellikler' },
  
  // Site/Güvenlik
  { status: 'FOR_RENT', category: 'HOUSING', key: 'inComplex', label: 'Site İçi mi', type: 'SELECT', options: EVET_HAYIR, sortOrder: 700, groupName: 'Site/Güvenlik' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'playground', label: 'Oyun Parkı', type: 'SELECT', options: VAR_YOK, sortOrder: 710, groupName: 'Site/Güvenlik' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'gazebo', label: 'Kamelya', type: 'SELECT', options: VAR_YOK, sortOrder: 720, groupName: 'Site/Güvenlik' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'security', label: 'Güvenlik', type: 'SELECT', options: GUVENLIK, allowsMultiple: true, sortOrder: 730, groupName: 'Site/Güvenlik' },
  
  // Aktiviteler
  { status: 'FOR_RENT', category: 'HOUSING', key: 'activities', label: 'Aktivite', type: 'SELECT', options: AKTIVITE, allowsMultiple: true, sortOrder: 800, groupName: 'Aktiviteler' },
  
  // Muhit
  { status: 'FOR_RENT', category: 'HOUSING', key: 'neighborhood', label: 'Muhit', type: 'SELECT', options: MUHIT, allowsMultiple: true, sortOrder: 900, groupName: 'Muhit' },
  
  // Ödeme/Durum (Kiralık için farklı)
  { status: 'FOR_RENT', category: 'HOUSING', key: 'dues', label: 'Aidat', type: 'TEXT', sortOrder: 1000, groupName: 'Ödeme/Durum', suffix: '₺' },
  { status: 'FOR_RENT', category: 'HOUSING', key: 'furnished', label: 'Eşyalı mı', type: 'SELECT', options: EVET_HAYIR, sortOrder: 1010, groupName: 'Ödeme/Durum' },
];

// ==========================================
// SATILIK ARSA ÖZELLİKLERİ
// ==========================================
const SATILIK_ARSA_ATTRIBUTES: AttributeDef[] = [
  { status: 'FOR_SALE', category: 'LAND', key: 'zoningStatus', label: 'İmar Durumu', type: 'SELECT', options: IMAR_DURUMU, isRequired: true, sortOrder: 10, groupName: 'Temel Bilgiler' },
  { status: 'FOR_SALE', category: 'LAND', key: 'landForBuilding', label: 'Kat Karşılığı', type: 'SELECT', options: ['Evet', 'Hayır'], sortOrder: 20, groupName: 'Temel Bilgiler' },
  { status: 'FOR_SALE', category: 'LAND', key: 'blockParcel', label: 'Ada/Parsel', type: 'TEXT', sortOrder: 30, groupName: 'Temel Bilgiler' },
  { status: 'FOR_SALE', category: 'LAND', key: 'landArea', label: 'Metresi', type: 'NUMBER', sortOrder: 40, groupName: 'Temel Bilgiler', suffix: 'm²' },
  { status: 'FOR_SALE', category: 'LAND', key: 'taks', label: 'T.A.K.S.', type: 'TEXT', sortOrder: 50, groupName: 'İmar Bilgileri' },
  { status: 'FOR_SALE', category: 'LAND', key: 'kaks', label: 'K.A.K.S.', type: 'TEXT', sortOrder: 60, groupName: 'İmar Bilgileri' },
  { status: 'FOR_SALE', category: 'LAND', key: 'floorCount', label: 'Kat Adedi', type: 'TEXT', sortOrder: 70, groupName: 'İmar Bilgileri' },
  { status: 'FOR_SALE', category: 'LAND', key: 'height', label: 'Yükseklik', type: 'TEXT', sortOrder: 80, groupName: 'İmar Bilgileri' },
  { status: 'FOR_SALE', category: 'LAND', key: 'roadSurrender', label: 'Yola Terk', type: 'NUMBER', sortOrder: 90, groupName: 'İmar Bilgileri', suffix: 'm²' },
  { status: 'FOR_SALE', category: 'LAND', key: 'buildingOrder', label: 'Nizam', type: 'SELECT', options: NIZAM, allowsMultiple: true, sortOrder: 100, groupName: 'İmar Bilgileri' },
  { status: 'FOR_SALE', category: 'LAND', key: 'roadFrontage', label: 'Yola Cephesi', type: 'NUMBER', sortOrder: 110, groupName: 'Konum', suffix: 'm' },
  { status: 'FOR_SALE', category: 'LAND', key: 'infrastructure', label: 'Alt Yapı', type: 'SELECT', options: ALTYAPI, allowsMultiple: true, sortOrder: 120, groupName: 'Altyapı' },
  { status: 'FOR_SALE', category: 'LAND', key: 'exchange', label: 'Takas', type: 'SELECT', options: ['Var', 'Yok', 'Değerlendirilir'], sortOrder: 130, groupName: 'Ödeme' },
  { status: 'FOR_SALE', category: 'LAND', key: 'creditEligible', label: 'Krediye Uygun mu', type: 'SELECT', options: ['Evet', 'Hayır', 'Bilinmiyor'], sortOrder: 140, groupName: 'Ödeme' },
  { status: 'FOR_SALE', category: 'LAND', key: 'shareStatus', label: 'Hisse Durumu', type: 'SELECT', options: HISSE_DURUMU, sortOrder: 150, groupName: 'Ödeme' },
];

// ==========================================
// SATILIK TİCARİ ÖZELLİKLERİ
// ==========================================
const SATILIK_TICARI_ATTRIBUTES: AttributeDef[] = [
  { status: 'FOR_SALE', category: 'COMMERCIAL', key: 'commercialArea', label: 'Metresi', type: 'NUMBER', sortOrder: 10, groupName: 'Temel Bilgiler', suffix: 'm²' },
  { status: 'FOR_SALE', category: 'COMMERCIAL', key: 'floorCount', label: 'Kat Sayısı', type: 'SELECT', options: TICARI_KAT, allowsMultiple: true, sortOrder: 20, groupName: 'Temel Bilgiler' },
  { status: 'FOR_SALE', category: 'COMMERCIAL', key: 'frontFacade', label: 'Ön Cephe Uzunluk', type: 'NUMBER', sortOrder: 30, groupName: 'Temel Bilgiler', suffix: 'm' },
  { status: 'FOR_SALE', category: 'COMMERCIAL', key: 'buildingAge', label: 'Bina Yaşı', type: 'SELECT', options: BINA_YASI, sortOrder: 40, groupName: 'Temel Bilgiler' },
  { status: 'FOR_SALE', category: 'COMMERCIAL', key: 'facing', label: 'Cephe', type: 'SELECT', options: CEPHE, allowsMultiple: true, sortOrder: 50, groupName: 'Temel Bilgiler' },
  { status: 'FOR_SALE', category: 'COMMERCIAL', key: 'hasTenant', label: 'Kiracılı mı', type: 'SELECT', options: EVET_HAYIR, sortOrder: 60, groupName: 'Durum' },
  { status: 'FOR_SALE', category: 'COMMERCIAL', key: 'rentalIncome', label: 'Kira Bedeli', type: 'TEXT', sortOrder: 70, groupName: 'Durum', suffix: '₺' },
  { status: 'FOR_SALE', category: 'COMMERCIAL', key: 'infrastructure', label: 'Altyapı', type: 'SELECT', options: ALTYAPI, allowsMultiple: true, sortOrder: 80, groupName: 'Altyapı' },
  { status: 'FOR_SALE', category: 'COMMERCIAL', key: 'exchange', label: 'Takas', type: 'SELECT', options: ['Var', 'Yok', 'Değerlendirilir'], sortOrder: 90, groupName: 'Ödeme' },
  { status: 'FOR_SALE', category: 'COMMERCIAL', key: 'creditEligible', label: 'Krediye Uygun mu', type: 'SELECT', options: ['Evet', 'Hayır', 'Bilinmiyor'], sortOrder: 100, groupName: 'Ödeme' },
  { status: 'FOR_SALE', category: 'COMMERCIAL', key: 'shareStatus', label: 'Hisse Durumu', type: 'SELECT', options: HISSE_DURUMU, sortOrder: 110, groupName: 'Ödeme' },
];

// ==========================================
// KİRALIK TİCARİ ÖZELLİKLERİ
// ==========================================
const KIRALIK_TICARI_ATTRIBUTES: AttributeDef[] = [
  { status: 'FOR_RENT', category: 'COMMERCIAL', key: 'commercialArea', label: 'Metresi', type: 'NUMBER', sortOrder: 10, groupName: 'Temel Bilgiler', suffix: 'm²' },
  { status: 'FOR_RENT', category: 'COMMERCIAL', key: 'floorCount', label: 'Kat Sayısı', type: 'SELECT', options: TICARI_KAT, allowsMultiple: true, sortOrder: 20, groupName: 'Temel Bilgiler' },
  { status: 'FOR_RENT', category: 'COMMERCIAL', key: 'frontFacade', label: 'Ön Cephe Uzunluk', type: 'NUMBER', sortOrder: 30, groupName: 'Temel Bilgiler', suffix: 'm' },
  { status: 'FOR_RENT', category: 'COMMERCIAL', key: 'buildingAge', label: 'Bina Yaşı', type: 'SELECT', options: BINA_YASI, sortOrder: 40, groupName: 'Temel Bilgiler' },
  { status: 'FOR_RENT', category: 'COMMERCIAL', key: 'facing', label: 'Cephe', type: 'SELECT', options: CEPHE, allowsMultiple: true, sortOrder: 50, groupName: 'Temel Bilgiler' },
  { status: 'FOR_RENT', category: 'COMMERCIAL', key: 'infrastructure', label: 'Altyapı', type: 'SELECT', options: ALTYAPI, allowsMultiple: true, sortOrder: 60, groupName: 'Altyapı' },
];

// ==========================================
// DEVREN SATILIK ÖZELLİKLERİ
// ==========================================
const DEVREN_ATTRIBUTES: AttributeDef[] = [
  { status: 'FOR_SALE', category: 'TRANSFER', key: 'commercialArea', label: 'Metresi', type: 'NUMBER', sortOrder: 10, groupName: 'Temel Bilgiler', suffix: 'm²' },
  { status: 'FOR_SALE', category: 'TRANSFER', key: 'floorCount', label: 'Kat Sayısı', type: 'SELECT', options: TICARI_KAT, allowsMultiple: true, sortOrder: 20, groupName: 'Temel Bilgiler' },
  { status: 'FOR_SALE', category: 'TRANSFER', key: 'frontFacade', label: 'Ön Cephe Uzunluk', type: 'NUMBER', sortOrder: 30, groupName: 'Temel Bilgiler', suffix: 'm' },
  { status: 'FOR_SALE', category: 'TRANSFER', key: 'buildingAge', label: 'Bina Yaşı', type: 'SELECT', options: BINA_YASI, sortOrder: 40, groupName: 'Temel Bilgiler' },
  { status: 'FOR_SALE', category: 'TRANSFER', key: 'facing', label: 'Cephe', type: 'SELECT', options: CEPHE, allowsMultiple: true, sortOrder: 50, groupName: 'Temel Bilgiler' },
  { status: 'FOR_SALE', category: 'TRANSFER', key: 'rentalIncome', label: 'Kira Bedeli', type: 'TEXT', sortOrder: 60, groupName: 'Durum', suffix: '₺' },
  { status: 'FOR_SALE', category: 'TRANSFER', key: 'infrastructure', label: 'Altyapı', type: 'SELECT', options: ALTYAPI, allowsMultiple: true, sortOrder: 70, groupName: 'Altyapı' },
  { status: 'FOR_SALE', category: 'TRANSFER', key: 'exchange', label: 'Takas', type: 'SELECT', options: ['Var', 'Yok', 'Değerlendirilir'], sortOrder: 80, groupName: 'Ödeme' },
];

// ==========================================
// TARLA ÖZELLİKLERİ
// ==========================================
const TARLA_ATTRIBUTES: AttributeDef[] = [
  { status: 'FOR_SALE', category: 'FIELD', key: 'blockParcel', label: 'Ada/Parsel', type: 'TEXT', sortOrder: 10, groupName: 'Temel Bilgiler' },
  { status: 'FOR_SALE', category: 'FIELD', key: 'fieldArea', label: 'Metresi', type: 'NUMBER', sortOrder: 20, groupName: 'Temel Bilgiler', suffix: 'm²' },
  { status: 'FOR_SALE', category: 'FIELD', key: 'waterStatus', label: 'Su Durumu', type: 'SELECT', options: SU_DURUMU, allowsMultiple: true, sortOrder: 30, groupName: 'Altyapı' },
  { status: 'FOR_SALE', category: 'FIELD', key: 'electricityStatus', label: 'Elektrik Durumu', type: 'SELECT', options: ELEKTRIK_DURUMU, sortOrder: 40, groupName: 'Altyapı' },
  { status: 'FOR_SALE', category: 'FIELD', key: 'roadStatus', label: 'Yol Durumu', type: 'SELECT', options: YOL_DURUMU, allowsMultiple: true, sortOrder: 50, groupName: 'Altyapı' },
  { status: 'FOR_SALE', category: 'FIELD', key: 'roadFrontage', label: 'Yola Cephe', type: 'NUMBER', sortOrder: 60, groupName: 'Konum', suffix: 'm' },
  { status: 'FOR_SALE', category: 'FIELD', key: 'fence', label: 'Tel Örgü', type: 'SELECT', options: VAR_YOK, sortOrder: 70, groupName: 'Özellikler' },
  { status: 'FOR_SALE', category: 'FIELD', key: 'house', label: 'Ev', type: 'SELECT', options: EV_TIPI, allowsMultiple: true, sortOrder: 80, groupName: 'Özellikler' },
  { status: 'FOR_SALE', category: 'FIELD', key: 'pool', label: 'Havuz', type: 'SELECT', options: HAVUZ, allowsMultiple: true, sortOrder: 90, groupName: 'Özellikler' },
  { status: 'FOR_SALE', category: 'FIELD', key: 'warehouse', label: 'Depo/Garaj', type: 'SELECT', options: VAR_YOK, sortOrder: 100, groupName: 'Özellikler' },
  { status: 'FOR_SALE', category: 'FIELD', key: 'irrigationSystem', label: 'Sulama Tesisatı', type: 'SELECT', options: VAR_YOK, sortOrder: 110, groupName: 'Özellikler' },
  { status: 'FOR_SALE', category: 'FIELD', key: 'equipment', label: 'Teçhizat/Aletler', type: 'TEXT', sortOrder: 120, groupName: 'Özellikler' },
  { status: 'FOR_SALE', category: 'FIELD', key: 'slope', label: 'Eğim (Derece)', type: 'TEXT', sortOrder: 130, groupName: 'Özellikler' },
  { status: 'FOR_SALE', category: 'FIELD', key: 'exchange', label: 'Takas', type: 'SELECT', options: ['Var', 'Yok', 'Değerlendirilir'], sortOrder: 140, groupName: 'Ödeme' },
  { status: 'FOR_SALE', category: 'FIELD', key: 'creditEligible', label: 'Krediye Uygun mu', type: 'SELECT', options: ['Evet', 'Hayır', 'Bilinmiyor'], sortOrder: 150, groupName: 'Ödeme' },
  { status: 'FOR_SALE', category: 'FIELD', key: 'shareStatus', label: 'Hisse Durumu', type: 'SELECT', options: HISSE_DURUMU, sortOrder: 160, groupName: 'Ödeme' },
];

// ==========================================
// BAHÇE ÖZELLİKLERİ
// ==========================================
const BAHCE_ATTRIBUTES: AttributeDef[] = [
  { status: 'FOR_SALE', category: 'GARDEN', key: 'blockParcel', label: 'Ada/Parsel', type: 'TEXT', sortOrder: 10, groupName: 'Temel Bilgiler' },
  { status: 'FOR_SALE', category: 'GARDEN', key: 'gardenArea', label: 'Metresi', type: 'NUMBER', sortOrder: 20, groupName: 'Temel Bilgiler', suffix: 'm²' },
  { status: 'FOR_SALE', category: 'GARDEN', key: 'fruitType', label: 'Meyve Cinsi', type: 'TEXT', sortOrder: 30, groupName: 'Bahçe Bilgileri' },
  { status: 'FOR_SALE', category: 'GARDEN', key: 'treeCount', label: 'Ağaç Sayısı', type: 'TEXT', sortOrder: 40, groupName: 'Bahçe Bilgileri' },
  { status: 'FOR_SALE', category: 'GARDEN', key: 'treeAge', label: 'Ağaç Yaşı', type: 'TEXT', sortOrder: 50, groupName: 'Bahçe Bilgileri' },
  { status: 'FOR_SALE', category: 'GARDEN', key: 'waterStatus', label: 'Su Durumu', type: 'SELECT', options: SU_DURUMU, allowsMultiple: true, sortOrder: 60, groupName: 'Altyapı' },
  { status: 'FOR_SALE', category: 'GARDEN', key: 'electricityStatus', label: 'Elektrik Durumu', type: 'SELECT', options: ELEKTRIK_DURUMU, sortOrder: 70, groupName: 'Altyapı' },
  { status: 'FOR_SALE', category: 'GARDEN', key: 'roadStatus', label: 'Yol Durumu', type: 'SELECT', options: YOL_DURUMU, allowsMultiple: true, sortOrder: 80, groupName: 'Altyapı' },
  { status: 'FOR_SALE', category: 'GARDEN', key: 'roadFrontage', label: 'Yola Cephe', type: 'NUMBER', sortOrder: 90, groupName: 'Konum', suffix: 'm' },
  { status: 'FOR_SALE', category: 'GARDEN', key: 'fence', label: 'Tel Örgü', type: 'SELECT', options: VAR_YOK, sortOrder: 100, groupName: 'Özellikler' },
  { status: 'FOR_SALE', category: 'GARDEN', key: 'house', label: 'Ev', type: 'SELECT', options: EV_TIPI, allowsMultiple: true, sortOrder: 110, groupName: 'Özellikler' },
  { status: 'FOR_SALE', category: 'GARDEN', key: 'pool', label: 'Havuz', type: 'SELECT', options: HAVUZ, allowsMultiple: true, sortOrder: 120, groupName: 'Özellikler' },
  { status: 'FOR_SALE', category: 'GARDEN', key: 'warehouse', label: 'Depo/Garaj', type: 'SELECT', options: VAR_YOK, sortOrder: 130, groupName: 'Özellikler' },
  { status: 'FOR_SALE', category: 'GARDEN', key: 'irrigationSystem', label: 'Sulama Tesisatı', type: 'SELECT', options: VAR_YOK, sortOrder: 140, groupName: 'Özellikler' },
  { status: 'FOR_SALE', category: 'GARDEN', key: 'equipment', label: 'Teçhizat/Aletler', type: 'TEXT', sortOrder: 150, groupName: 'Özellikler' },
  { status: 'FOR_SALE', category: 'GARDEN', key: 'slope', label: 'Eğim (Derece)', type: 'TEXT', sortOrder: 160, groupName: 'Özellikler' },
  { status: 'FOR_SALE', category: 'GARDEN', key: 'exchange', label: 'Takas', type: 'SELECT', options: ['Var', 'Yok', 'Değerlendirilir'], sortOrder: 170, groupName: 'Ödeme' },
  { status: 'FOR_SALE', category: 'GARDEN', key: 'creditEligible', label: 'Krediye Uygun mu', type: 'SELECT', options: ['Evet', 'Hayır', 'Bilinmiyor'], sortOrder: 180, groupName: 'Ödeme' },
  { status: 'FOR_SALE', category: 'GARDEN', key: 'shareStatus', label: 'Hisse Durumu', type: 'SELECT', options: HISSE_DURUMU, sortOrder: 190, groupName: 'Ödeme' },
];

// ==========================================
// HOBİ BAHÇESİ ÖZELLİKLERİ
// ==========================================
const HOBI_BAHCESI_ATTRIBUTES: AttributeDef[] = [
  { status: 'FOR_SALE', category: 'HOBBY_GARDEN', key: 'blockParcel', label: 'Ada/Parsel', type: 'TEXT', sortOrder: 10, groupName: 'Temel Bilgiler' },
  { status: 'FOR_SALE', category: 'HOBBY_GARDEN', key: 'gardenArea', label: 'Metresi', type: 'NUMBER', sortOrder: 20, groupName: 'Temel Bilgiler', suffix: 'm²' },
  { status: 'FOR_SALE', category: 'HOBBY_GARDEN', key: 'treeCount', label: 'Ağaç Sayısı', type: 'TEXT', sortOrder: 30, groupName: 'Bahçe Bilgileri' },
  { status: 'FOR_SALE', category: 'HOBBY_GARDEN', key: 'waterStatus', label: 'Su Durumu', type: 'SELECT', options: SU_DURUMU, allowsMultiple: true, sortOrder: 40, groupName: 'Altyapı' },
  { status: 'FOR_SALE', category: 'HOBBY_GARDEN', key: 'electricityStatus', label: 'Elektrik Durumu', type: 'SELECT', options: ELEKTRIK_DURUMU, sortOrder: 50, groupName: 'Altyapı' },
  { status: 'FOR_SALE', category: 'HOBBY_GARDEN', key: 'roadStatus', label: 'Yol Durumu', type: 'SELECT', options: YOL_DURUMU, allowsMultiple: true, sortOrder: 60, groupName: 'Altyapı' },
  { status: 'FOR_SALE', category: 'HOBBY_GARDEN', key: 'roadFrontage', label: 'Yola Cephe', type: 'NUMBER', sortOrder: 70, groupName: 'Konum', suffix: 'm' },
  { status: 'FOR_SALE', category: 'HOBBY_GARDEN', key: 'fence', label: 'Tel Örgü', type: 'SELECT', options: VAR_YOK, sortOrder: 80, groupName: 'Özellikler' },
  { status: 'FOR_SALE', category: 'HOBBY_GARDEN', key: 'house', label: 'Ev', type: 'SELECT', options: [...EV_TIPI, '5+1', '6+1'], allowsMultiple: true, sortOrder: 90, groupName: 'Özellikler' },
  { status: 'FOR_SALE', category: 'HOBBY_GARDEN', key: 'houseGrossArea', label: 'Ev Brüt', type: 'NUMBER', sortOrder: 100, groupName: 'Özellikler', suffix: 'm²' },
  { status: 'FOR_SALE', category: 'HOBBY_GARDEN', key: 'houseFloors', label: 'Kat Sayısı', type: 'SELECT', options: ['1', '2', '3', '4'], sortOrder: 110, groupName: 'Özellikler' },
  { status: 'FOR_SALE', category: 'HOBBY_GARDEN', key: 'pool', label: 'Havuz', type: 'SELECT', options: HAVUZ, allowsMultiple: true, sortOrder: 120, groupName: 'Özellikler' },
  { status: 'FOR_SALE', category: 'HOBBY_GARDEN', key: 'warehouse', label: 'Depo/Garaj', type: 'SELECT', options: VAR_YOK, sortOrder: 130, groupName: 'Özellikler' },
  { status: 'FOR_SALE', category: 'HOBBY_GARDEN', key: 'irrigationSystem', label: 'Sulama Tesisatı', type: 'SELECT', options: VAR_YOK, sortOrder: 140, groupName: 'Özellikler' },
  { status: 'FOR_SALE', category: 'HOBBY_GARDEN', key: 'equipment', label: 'Teçhizat/Aletler', type: 'TEXT', sortOrder: 150, groupName: 'Özellikler' },
  { status: 'FOR_SALE', category: 'HOBBY_GARDEN', key: 'slope', label: 'Eğim (Derece)', type: 'TEXT', sortOrder: 160, groupName: 'Özellikler' },
  { status: 'FOR_SALE', category: 'HOBBY_GARDEN', key: 'exchange', label: 'Takas', type: 'SELECT', options: ['Var', 'Yok', 'Değerlendirilir'], sortOrder: 170, groupName: 'Ödeme' },
  { status: 'FOR_SALE', category: 'HOBBY_GARDEN', key: 'creditEligible', label: 'Krediye Uygun mu', type: 'SELECT', options: ['Evet', 'Hayır', 'Bilinmiyor'], sortOrder: 180, groupName: 'Ödeme' },
  { status: 'FOR_SALE', category: 'HOBBY_GARDEN', key: 'shareStatus', label: 'Hisse Durumu', type: 'SELECT', options: HISSE_DURUMU, sortOrder: 190, groupName: 'Ödeme' },
];

// ==========================================
// TÜM ÖZELLİKLER
// ==========================================
export const ALL_ATTRIBUTES: AttributeDef[] = [
  ...SATILIK_KONUT_ATTRIBUTES,
  ...KIRALIK_KONUT_ATTRIBUTES,
  ...SATILIK_ARSA_ATTRIBUTES,
  ...SATILIK_TICARI_ATTRIBUTES,
  ...KIRALIK_TICARI_ATTRIBUTES,
  ...DEVREN_ATTRIBUTES,
  ...TARLA_ATTRIBUTES,
  ...BAHCE_ATTRIBUTES,
  ...HOBI_BAHCESI_ATTRIBUTES,
];

// ==========================================
// SEED FONKSİYONU
// ==========================================
export async function seedListingAttributes(prisma: PrismaClient) {
  // Önce mevcut özellik tanımlarını sil
  await prisma.listingAttributeDefinition.deleteMany();
  
  // Yeni özellikleri ekle
  for (const attr of ALL_ATTRIBUTES) {
    await prisma.listingAttributeDefinition.create({
      data: {
        status: attr.status ?? null,
        category: attr.category,
        subPropertyType: attr.subPropertyType ?? null,
        key: attr.key,
        label: attr.label,
        type: attr.type,
        options: attr.options ?? undefined,
        allowsMultiple: attr.allowsMultiple ?? false,
        isRequired: attr.isRequired ?? false,
        sortOrder: attr.sortOrder,
        groupName: attr.groupName ?? null,
        placeholder: attr.placeholder ?? null,
        suffix: attr.suffix ?? null,
        helpText: attr.helpText ?? null,
      },
    });
  }
  
  // İlan sayacını başlat
  await prisma.listingCounter.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default', lastNumber: 0 },
  });
  
  return {
    attributeCount: ALL_ATTRIBUTES.length,
  };
}

// Export types and constants
export type { AttributeDef };
export {
  SATILIK_KONUT_ATTRIBUTES,
  KIRALIK_KONUT_ATTRIBUTES,
  SATILIK_ARSA_ATTRIBUTES,
  SATILIK_TICARI_ATTRIBUTES,
  KIRALIK_TICARI_ATTRIBUTES,
  DEVREN_ATTRIBUTES,
  TARLA_ATTRIBUTES,
  BAHCE_ATTRIBUTES,
  HOBI_BAHCESI_ATTRIBUTES,
};
