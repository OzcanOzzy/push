"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// --- SABİT VERİLER ---
const FIXED_LOGO_URL = "https://i.hizliresim.com/fa4ibjl.png"; 
const DEFAULT_PROFILE_PHOTO = "https://i.hizliresim.com/eqya4c4.png";

const officeDetails: Record<string, any> = {
  eregli: { name: 'Ereğli Şubesi', city: 'Konya', address: 'Yunuslu mh. uğur mumcu caddesi 35/A Ereğli/Konya', phone: '0533 638 7000', authNo: '4202207' },
  karaman: { name: 'Karaman Şubesi', city: 'Karaman', address: 'İmaret mahallesi 173. sokak No:3/A Karaman', phone: '0543 306 14 99', authNo: '7000161' },
  konya: { name: 'Konya Şubesi', city: 'Konya', address: 'Konya Merkez', phone: '0543 306 14 99', authNo: '7000161' },
  alanya: { name: 'Alanya Şubesi', city: 'Antalya', address: 'Alanya Merkez', phone: '0543 306 14 99', authNo: '0704618' }
};

const detailedCities = ["Konya", "Karaman", "Antalya", "Mersin", "Eskişehir"];
const locationData: Record<string, Record<string, string[]>> = {
  "Konya": {
    "Ereğli": ["500 Evler", "Acıkuyu", "Acıpınar", "Adabağ", "Akhüyük", "Alhan", "Alpaslan", "Aşağı Göndelen", "Aşıklar", "Atakent", "Aydınlar", "Aziziye", "Bahçeli", "Barbaros", "Beyköy", "Bulgurluk", "Cumhuriyet", "Çakmak", "Eti", "Fatih", "Gülbahçe", "Hamidiye", "Mimar Sinan", "Namık Kemal", "Orhangazi", "Selçuklu", "Sümer", "Türbe", "Yenibağlar", "Yunuslu", "Ziya Gökalp"],
    "Karatay": ["Akabe", "Fetih", "Fevzi Çakmak", "İstiklal", "Karaaslan", "Keçeciler"],
    "Meram": ["Alavardı", "Aybahçe", "Dere", "Gödene", "Havzan", "Konevi"],
    "Selçuklu": ["Aydınlıkevler", "Bosna Hersek", "Cumhuriyet", "Fatih", "Feritpaşa", "Hocacihan", "Işıklar", "Nişantaşı", "Yazır"]
  },
  "Karaman": {
    "Merkez": ["Abbas", "Ahiosman", "Ahmet Yesevi", "Alacasuluk", "Atatürk", "Bahçelievler", "Başakşehir", "Cumhuriyet", "Fatih", "Hacıcelal", "Hamidiye", "Hisar", "İmaret", "Larende", "Mahmudiye", "Yenişehir", "Yunus Emre"],
    "Ermenek": ["Taşbaşı", "Seyran", "Meydan"]
  },
  "Antalya": {
    "Alanya": ["Avsallar", "Bektaş", "Cikcilli", "Cumhuriyet", "Çıplaklı", "Demirtaş", "Güller Pınarı", "Kestel", "Konaklı", "Mahmutlar", "Oba", "Payallar", "Tosmur", "Türkler"],
    "Muratpaşa": ["Bahçelievler", "Çağlayan", "Fener", "Güzeloba", "Kızıltoprak", "Lara", "Meltem"]
  },
  "Mersin": { 
    "Yenişehir": ["50. Yıl", "Afetevler", "Akkent", "Bahçelievler", "Barbaros"], 
    "Mezitli": ["Akdeniz", "Davultepe", "Fatih", "Kuyuluk"] 
  },
  "Eskişehir": { 
    "Odunpazarı": ["71 Evler", "Akarbaşı", "Akcami", "Alanönü"], 
    "Tepebaşı": ["Aşağı Söğütönü", "Batıkent", "Çamlıca"] 
  }
};

// --- TÜM SEÇENEKLER (ORİJİNAL) ---
const options: Record<string, string[]> = {
  rooms: ["1+0", "1+1", "2+0", "2+1", "3+0", "3+1", "4+0", "4+1", "5+1", "5+2", "6+1", "6+2", "6+3", "7+1", "7+2", "7+3", "7+4", "8+1", "8+2", "8+3", "8+4", "Diğer"],
  floors: ["Zemin Kat", "Yüksek Giriş", "Dükkan Üstü", "Bodrum Kat", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25"],
  totalFloors: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25"],
  flatCount: ["Müstakil", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"],
  age: ["Sıfır", "İnşaat Hali", "1", "2", "3", "4", "5", "6-10 arası", "11-15 arası", "16-20 arası", "21-25 arası", "26-30 arası", "30 üstü"],
  facade: ["Kuzey", "Güney", "Doğu", "Batı"],
  wcCount: ["1", "2", "3", "4", "5"],
  heating: ["Bireysel Kombi", "Merkezi (Pay ölçer)", "Yerden Isıtma", "Sobalı", "Elektrik", "Klima"],
  balcony: ["Yok", "1", "2", "3", "4", "5", "6"],
  glassBalcony: ["Var", "Yok", "1", "2", "3", "4", "5", "6"],
  insulation: ["Var", "Yok", "İçten", "Dıştan", "İçten ve Dıştan"],
  elevator: ["Var", "Yok", "Çift Asansör", "Yapım Aşamasında"],
  garage: ["Var", "Yok", "Bireysel Garaj", "Ortak Kullanım"],
  parking: ["Var", "Yok", "Açık", "Kapalı", "Açık ve Kapalı"],
  usage: ["Mülk Sahibi", "Boş", "Kiracılı", "Yapım Aşamasında"],
  swap: ["Var", "Yok", "Değerlendirilir", "Araç ile takas", "Daire ile Takas", "Gayrimenkul ile takas"],
  credit: ["Evet", "Hayır", "Bilinmiyor", "Kısmen"],
  deed: ["Kat Mülkiyeti", "Kat İrtifakı", "Arsa Tapulu"],
  hisse: ["Hisseli", "Müstakil"],
  iskan: ["Var", "Yok", "Alınacak"],
  konutTipi: ["Apart", "Daire", "Dublex", "Triplex", "Villa", "Müstakil Ev", "Devremülk", "Diğer"],
  katTipi: ["Ara Kat", "Çatı Katı", "Bahçe Katı", "Teras Kat", "Diğer"],
  banyoSayisi: ["1", "2", "3", "4", "5"],
  tuvaletTipi: ["Alaturka", "Alafranga"],
  icKapilar: ["Panel", "Lake", "Ahşap", "Pvc", "Metal", "Diğer"],
  pencereler: ["Pvc", "Ahşap", "Metal", "Diğer"],
  zeminler: ["Laminant", "Granit", "Ahşap Parke", "Fayans", "Beton", "Diğer"],
  mutfakDolabi: ["Sıfır", "Yeni", "İyi", "Orta", "Kötü", "Yok"],
  bahce: ["Var", "Yok", "Bireysel", "Ortak Kullanım", "Kış Bahçeli"],
  panjur: ["Var", "Yok", "Otomatik Panjur", "Manuel Panjur"],
  guvenlik: ["Var", "Yok", "Kamera Sistemi", "Güvenlik"],
  aktivite: ["Spa", "Sauna", "Hamam", "Açık Havuz", "Kapalı Havuz", "Spor Salonu", "Tenis Kortu", "Basketbol Sahası", "Futbol Sahası", "Toplantı salonu", "Kreş"],
  kiler: ["Var", "Yok", "Dairede", "Bodrumda", "Çatıda", "Balkonda", "Bahçede"],
  arsaTipi: ["Konut", "Ticari", "Konut + Ticari", "Otel", "Sanayi", "AVM", "Diğer"],
  imarDurumu: ["İmarlı", "İmarsız", "18. Madde kapsamında", "Diğer"],
  nizam: ["Ayrık", "Bitişik", "Blok", "İkiz", "Birlikte Yapılaşma", "Diğer"],
  altYapi: ["Elektrik", "Su", "Sanayi Elektriği", "Doğalgaz", "İnternet", "Telekom", "Fiber", "Kanalizasyon", "Yol"],
  tarlaTipi: ["Sulu", "Kıraç", "Verimli", "Taşlık", "Marjinal"],
  suDurumu: ["Var", "Yok", "Şebeke", "Kooperatif", "Sondaj Kuyu", "Kanaldan Sulama", "Dereden", "Diğer"],
  elektrikDurumu: ["Var", "Yok", "Alınabilir"],
  yolDurumu: ["Var", "Yok", "Patika yol", "Kadastro Yolu"],
  evDurumu: ["Var", "Yok", "1+1", "2+1", "3+1", "4+1", "Dublex", "Triplex"],
  havuzDurumu: ["Var", "Yok", "Sulama Havuzu", "Yüzme Havuzu", "Bilinmiyor"],
  bahceTipi: ["Elma Bahçesi", "Ceviz Bahçesi", "Zeytin Bahçesi", "Badem Bahçesi", "Erik Bahçesi", "Kiraz Bahçesi", "Üzüm Bağı", "Meyve Bahçesi (Karışık)", "Hobi bahçesi", "Diğer"],
  ticariTipi: ["Dükkan", "Ofis", "Depo", "Sanayi Dükkanı", "Otel", "Fabrika", "Diğer"],
  katSayisiTicari: ["Bodrum", "Zemin", "Asma Kat", "1", "2", "3", "4", "5", "6"],
  mevki: ["Çarşı", "İlkokul", "Lise", "Üniversite", "Hastane", "Sağlık Ocağı", "Pazar", "AVM", "Market", "Eczane", "Belediye", "Dolmuş Hattı", "Otobüs Durağı", "Ana Cadde", "Ara Sokak"]
};

const featureCategories: Record<string, string[]> = {
  "İç Özellikler": ["ADSL", "Ahşap Doğrama", "Akıllı Ev", "Alarm", "Alaturka Tuvalet", "Alüminyum Doğrama", "Amerikan Kapı", "Amerikan Mutfak", "Ankastre Fırın", "Barbükü", "Beyaz Eşya", "Boyalı", "Bulaşık Makinesi", "Buzdolabı", "Çamaşır Odası", "Çelik Kapı", "Duşakabin", "Duvar Kağıdı", "Fiber İnternet", "Fırın", "Giyinme Odası", "Gömme Dolap", "Görüntülü Diafon", "Hilton Banyo", "Isıcam", "Jakuzi", "Kartonpiyer", "Klima", "Laminat Zemin", "Marley", "Mobilyalı", "Panjur", "Parke Zemin", "PVC Doğrama", "Seramik Zemin", "Spot Aydınlatma", "Şömine", "Teras", "Vestiyer", "Wi-Fi", "Yüz Tanıma & Parmak İzi"],
  "Dış Özellikler": ["Araç Şarj İstasyonu", "24 Saat Güvenlik", "Apartman Görevlisi", "Buhar Odası", "Çocuk Oyun Parkı", "Hidrofor", "Jeneratör", "Kablo TV", "Kamera Sistemi", "Kapalı Otopark", "Kreş", "Müstakil Havuzlu", "Oyun Parkı", "Sauna", "Ses Yalıtımı", "Siding", "Spor Alanı", "Su Deposu", "Tenis Kortu", "Uydu", "Yangın Merdiveni", "Yüzme Havuzu (Açık)", "Yüzme Havuzu (Kapalı)"],
  "Muhit / Konum": ["Alışveriş Merkezi", "Belediye", "Cami", "Cemevi", "Denize Sıfır", "Eczane", "Eğlence Merkezi", "Fuar Alanı", "Göl Manzaralı", "Hastane", "Havra", "İlkokul-Ortaokul", "İtfaiye", "Kilise", "Lise", "Market", "Merkezi", "Park", "Polis Merkezi", "Sağlık Ocağı", "Semt Pazarı", "Şehir Manzaralı", "Şehir Merkezi", "Üniversite"],
  "Ulaşım": ["Anayol", "Avrasya Tüneli", "Boğaz Köprüleri", "Cadde", "Dolmuş", "E-5", "Havaalanı", "İskele", "Marmaray", "Metro", "Metrobüs", "Minibüs", "Otobüs Durağı", "Sahil", "TEM", "Teleferik", "Tramvay", "Tren İstasyonu", "Troleybüs"]
};

const allCities = ["Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"].sort();

export default function IlanHazirlaPage() {
  const [isReady, setIsReady] = useState(false);
  const [activeTab, setActiveTab] = useState('social');
  const [designMode, setDesignMode] = useState('single');
  const [isManualLocation, setIsManualLocation] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const captureContainerRef = useRef<HTMLDivElement>(null);
  
  const [showLogo, setShowLogo] = useState(true);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [themeColor, setThemeColor] = useState('#ea580c');
  const [showWebsiteOzcan, setShowWebsiteOzcan] = useState(true);
  const [showWebsiteEmlaknomi, setShowWebsiteEmlaknomi] = useState(true);

  const [consultant, setConsultant] = useState({
    name: 'Özcan AKTAŞ',
    phone: '0533 638 7000',
    photo: DEFAULT_PROFILE_PHOTO,
    showInfo: true,
    showPhoto: true
  });

  const [selectedOffice, setSelectedOffice] = useState('eregli');
  
  const [formData, setFormData] = useState<any>({
    customTitle: '', title: '', price: '', currency: 'TL',
    city: 'Konya', district: 'Ereğli', neighborhood: 'Yunuslu',
    type: 'Satılık Daire', adNumber: '', 
    // Konut
    rooms: '', size: '', netSize: '', totalFloors: '', floor: '', flatCountOnFloor: '', facade: [], age: '',
    masterBath: '', wcCount: '', heating: [], balconyCount: '', glassBalcony: '', insulation: '', elevator: '', pantry: [], garage: '',
    parking: '', usageStatus: '', deedStatus: '', creditSuitable: '', swapAvailable: '', hisseDurumu: '', iskan: '',
    konutTipi: '', katTipi: '', banyoSayisi: '', tuvaletTipi: [], kizartmaMutfagi: '', giyinmeOdasi: '', camasirOdasi: '',
    icKapilar: '', pencereler: '', asmaTavan: '', dusakabin: '', vestiyer: '', catiKaplama: '', zeminler: '', mutfakDolabi: '',
    celikKapi: '', bahce: [], esyali: '', panjur: [], ankastre: '', siteIci: '', oyunParki: '', kamelya: '', guvenlik: [], aktivite: [],
    aidat: '', kiraBedeli: '',
    // Arsa
    arsaTipi: '', imarDurumu: '', adaParsel: '', taks: '', kaks: '', katAdedi: '', yukseklik: '', yolaTerk: '', nizam: '', yolaCephesi: '',
    altYapi: [], katKarsiligi: '',
    // Tarla/Bahçe
    tarlaTipi: [], suDurumu: [], elektrikDurumu: '', yolDurumu: [], telOrgu: '', evDurumu: [], havuzDurumu: '', depoGaraj: '', sulamaTesisati: '', techizat: '', egim: '',
    bahceTipi: '', meyveCinsi: '', agacSayisi: '', agacYasi: '',
    // Ticari
    gayrimenkulTipi: '', onCepheUzunluk: '', kiracilimi: '', mevki: [], katSayisiTicari: [],
    digerOzellikler: '', features: [], description: '',
    images: [], coverImageIndex: 0, logo: FIXED_LOGO_URL
  });

  const [privateData, setPrivateData] = useState({
    customerName: '', contactInfo: '', finalPrice: '', commission: '', propertyNo: '', notes: '', 
    date: new Date().toISOString().split('T')[0],
    deedStatusPrivate: '', doorCode: '', swapPrivate: '', openAddress: ''
  });

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({ 
    "İç Özellikler": true, 
    "Dış Özellikler": true, 
    "Muhit / Konum": false, 
    "Ulaşım": false 
  });

  const placeholderImage = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80';

  useEffect(() => {
    const loadScript = (src: string) => {
      return new Promise((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(true); return; }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
      });
    };

    Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'),
      loadScript('https://cdn.tailwindcss.com')
    ]).then(() => {
      const checkTailwind = setInterval(() => {
        if ((window as any).tailwind) {
          clearInterval(checkTailwind);
    setIsReady(true);
        }
      }, 50);
      setTimeout(() => { clearInterval(checkTailwind); setIsReady(true); }, 2000);
    });

    const savedLogo = localStorage.getItem('emlaknomi_custom_logo');
    if (savedLogo) { setCustomLogo(savedLogo); setShowLogo(true); }
  }, []);

  const toggleCategory = (category: string) => setOpenCategories(prev => ({...prev, [category]: !prev[category]}));

  const formatNumber = (value: string) => {
    if (!value) return '';
    return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (['price', 'kiraBedeli', 'aidat'].includes(name)) {
      setFormData((prev: any) => ({ ...prev, [name]: formatNumber(value) }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (['size', 'netSize', 'yolaTerk', 'yolaCephesi'].includes(name) && value && !value.includes('m²')) {
      setFormData((prev: any) => ({ ...prev, [name]: `${value} m²` }));
    }
  };

  const handleConsultantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setConsultant(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setConsultant(prev => ({ ...prev, photo: reader.result as string }));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handlePrivateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (['finalPrice', 'commission'].includes(name)) {
      setPrivateData(prev => ({ ...prev, [name]: formatNumber(value) }));
    } else {
      setPrivateData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMultiSelect = (field: string, value: string) => {
    const current = Array.isArray(formData[field]) ? formData[field] : [];
    const updated = current.includes(value) ? current.filter((i: string) => i !== value) : [...current, value];
    setFormData((prev: any) => ({ ...prev, [field]: updated }));
  };

  const handleOfficeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const officeKey = e.target.value;
    setSelectedOffice(officeKey);
    setIsManualLocation(false);
    setConsultant(prev => ({ ...prev, phone: officeDetails[officeKey].phone }));
    if (officeKey === 'eregli') setFormData((prev: any) => ({...prev, city: 'Konya', district: 'Ereğli', neighborhood: 'Yunuslu'}));
    else if (officeKey === 'karaman') setFormData((prev: any) => ({...prev, city: 'Karaman', district: 'Merkez', neighborhood: 'İmaret'}));
    else if (officeKey === 'alanya') setFormData((prev: any) => ({...prev, city: 'Antalya', district: 'Alanya', neighborhood: 'Mahmutlar'}));
    else if (officeKey === 'konya') setFormData((prev: any) => ({...prev, city: 'Konya', district: 'Selçuklu', neighborhood: 'Bosna Hersek'}));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value;
    if (detailedCities.includes(newCity)) {
      setIsManualLocation(false);
      const districts = Object.keys(locationData[newCity] || {});
      const firstDistrict = districts[0] || '';
      const neighborhoods = locationData[newCity]?.[firstDistrict] || [];
      setFormData((prev: any) => ({ ...prev, city: newCity, district: firstDistrict, neighborhood: neighborhoods[0] || '' }));
    } else {
      setIsManualLocation(true);
      setFormData((prev: any) => ({ ...prev, city: newCity, district: '', neighborhood: '' }));
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistrict = e.target.value;
    const neighborhoods = locationData[formData.city]?.[newDistrict] || [];
    setFormData((prev: any) => ({ ...prev, district: newDistrict, neighborhood: neighborhoods[0] || '' }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setFormData((prev: any) => ({ ...prev, images: [...prev.images, ...newImages] }));
    }
  };

  const removeImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newImages = formData.images.filter((_: any, i: number) => i !== index);
    let newCoverIndex = formData.coverImageIndex;
    if (index === formData.coverImageIndex) newCoverIndex = 0;
    else if (index < formData.coverImageIndex) newCoverIndex--;
    setFormData((prev: any) => ({ ...prev, images: newImages, coverImageIndex: newCoverIndex }));
  };

  const handleFeatureToggle = (feature: string) => {
    const newFeatures = formData.features.includes(feature) 
      ? formData.features.filter((f: string) => f !== feature) 
      : [...formData.features, feature];
    setFormData((prev: any) => ({ ...prev, features: newFeatures }));
  };

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  const getFloorDisplay = () => {
    const { floor, totalFloors } = formData;
    if (!floor) return null;
    if (isNaN(parseInt(floor))) return floor;
    const fl = parseInt(floor);
    const tf = parseInt(totalFloors);
    if (!isNaN(tf)) {
      if (fl === tf) return "Son Kat";
      if (fl > 0 && fl < tf) return "Ara Kat";
    }
    return `${floor}. Kat`;
  };

  const getSubTypeLabel = () => {
    if (formData.konutTipi) return formData.konutTipi;
    if (formData.arsaTipi) return formData.arsaTipi;
    if (formData.gayrimenkulTipi) return formData.gayrimenkulTipi;
    if (formData.bahceTipi) return formData.bahceTipi;
    if (formData.tarlaTipi && formData.tarlaTipi.length > 0) return formData.tarlaTipi[0];
    const split = formData.type.split(' ');
    if (split.length > 1) return split.slice(1).join(' ');
    return formData.type;
  };

  const getFullTypeLabel = () => {
    const operation = formData.type.split(' ')[0];
    const subType = getSubTypeLabel();
    return `${operation} ${subType}`.trim();
  };

  const getGeneratedTitle = () => {
    if (formData.customTitle) return formData.customTitle;
    let parts = [];
    if (formData.neighborhood) parts.push(`${formData.neighborhood}'da`);
    if (formData.rooms) parts.push(formData.rooms);
    if (formData.type.includes('Daire') || formData.konutTipi) {
      const fd = getFloorDisplay();
      if (fd) parts.push(fd);
    }
    parts.push(getFullTypeLabel());
    return parts.join(' ');
  };

  const generateDescription = () => {
    const office = officeDetails[selectedOffice];
    const generatedTitle = getGeneratedTitle();
    
    const addLine = (label: string, value: any, suffix = '') => {
      if (!value || value === '' || (Array.isArray(value) && value.length === 0)) return '';
      const valStr = Array.isArray(value) ? value.join(', ') : value;
      return `> ${label}: ${valStr}${suffix}\n`;
    };
    
    let detailsText = "";
    detailsText += `\n> İlan No: ${formData.adNumber || ''}\n\n`;

    if (formData.type.includes("Daire")) {
      detailsText += addLine('Konut Tipi', formData.konutTipi);
      detailsText += addLine('Oda Sayısı', formData.rooms);
      detailsText += addLine('Brüt m²', formData.size);
      detailsText += addLine('Net m²', formData.netSize);
      detailsText += addLine('Bulunduğu Kat', formData.floor);
      detailsText += addLine('Binadaki Kat', formData.totalFloors);
      detailsText += addLine('Kattaki Daire', formData.flatCountOnFloor);
      detailsText += addLine('Kat Tipi', formData.katTipi);
      detailsText += addLine('Bina Yaşı', formData.age);
      detailsText += addLine('Banyo Sayısı', formData.banyoSayisi);
      detailsText += addLine('Ebeveyn Banyo', formData.masterBath);
      detailsText += addLine('Tuvalet Sayısı', formData.wcCount);
      detailsText += addLine('Tuvalet Tipi', formData.tuvaletTipi);
      detailsText += addLine('Isıtma Tipi', formData.heating);
      detailsText += addLine('Isı Yalıtım', formData.insulation);
      detailsText += addLine('Balkon', formData.balconyCount);
      detailsText += addLine('Cam Balkon', formData.glassBalcony);
      detailsText += addLine('Asansör', formData.elevator);
      detailsText += addLine('İç Kapılar', formData.icKapilar);
      detailsText += addLine('Pencereler', formData.pencereler);
      detailsText += addLine('Zeminler', formData.zeminler);
      detailsText += addLine('Mutfak Dolabı', formData.mutfakDolabi);
      detailsText += addLine('Çelik Kapı', formData.celikKapi);
      detailsText += addLine('Kiler', formData.pantry);
      detailsText += addLine('Garaj', formData.garage);
      detailsText += addLine('Bahçe', formData.bahce);
      detailsText += addLine('Eşyalı mı', formData.esyali);
      detailsText += addLine('Otopark', formData.parking);
      detailsText += addLine('Panjur', formData.panjur);
      detailsText += addLine('Ankastre', formData.ankastre);
      detailsText += addLine('Site İçi', formData.siteIci);
      detailsText += addLine('Güvenlik', formData.guvenlik);
      detailsText += addLine('Aktivite', formData.aktivite);
      detailsText += addLine('Muhit', formData.mevki);
      detailsText += addLine('Aidat', formData.aidat);
      detailsText += addLine('Tapu Durumu', formData.deedStatus);
      detailsText += addLine('İskan/Oturum', formData.iskan);
      detailsText += addLine('Kullanım Durumu', formData.usageStatus);
      detailsText += addLine('Hisse Durumu', formData.hisseDurumu);
      detailsText += addLine('Kira Bedeli', formData.kiraBedeli);
    } else if (formData.type === "Satılık Arsa") {
      detailsText += addLine('Arsa Tipi', formData.arsaTipi);
      detailsText += addLine('İmar Durumu', formData.imarDurumu);
      detailsText += addLine('Ada/Parsel', formData.adaParsel);
      detailsText += addLine('Metresi', formData.size);
      detailsText += addLine('T.A.K.S.', formData.taks);
      detailsText += addLine('K.A.K.S.', formData.kaks);
      detailsText += addLine('Nizam', formData.nizam);
      detailsText += addLine('Alt Yapı', formData.altYapi);
    } else if (formData.type === "Satılık Tarla" || formData.type === "Satılık Bahçe") {
      detailsText += addLine('Tarla Tipi', formData.tarlaTipi);
      detailsText += addLine('Bahçe Tipi', formData.bahceTipi);
      detailsText += addLine('Ada/Parsel', formData.adaParsel);
      detailsText += addLine('Metresi', formData.size);
      detailsText += addLine('Su Durumu', formData.suDurumu);
      detailsText += addLine('Elektrik Durumu', formData.elektrikDurumu);
      detailsText += addLine('Yol Durumu', formData.yolDurumu);
      detailsText += addLine('Ev Durumu', formData.evDurumu);
      detailsText += addLine('Havuz Durumu', formData.havuzDurumu);
      detailsText += addLine('Hisse Durumu', formData.hisseDurumu);
    } else if (formData.type.includes("Ticari") || formData.type === "Devren Satılık") {
      detailsText += addLine('Gayrimenkul Tipi', formData.gayrimenkulTipi);
      detailsText += addLine('Metresi', formData.size);
      detailsText += addLine('Kat Sayısı', formData.katSayisiTicari);
    }

    detailsText += addLine('Cephe', formData.facade);
    if (formData.type !== "Devren Satılık" && !formData.type.includes('Kiralık')) {
      detailsText += addLine('Krediye Uygun', formData.creditSuitable);
      detailsText += addLine('Takas', formData.swapAvailable);
    }
    detailsText += addLine('Diğer Özellikler', formData.digerOzellikler);

    let featuresText = "";
    Object.keys(featureCategories).forEach(cat => {
      const selectedInCat = featureCategories[cat].filter(f => formData.features.includes(f));
      if (selectedInCat.length > 0) {
        featuresText += `\n\n> ${cat.toUpperCase()}:\n` + selectedInCat.join(', ');
      }
    });

    const desc = `EMLAKNOMİ'DEN ${generatedTitle.toUpperCase()}\n\n` +
      `Konum: ${formData.city} / ${formData.district} / ${formData.neighborhood}\n\n` +
      `GAYRİMENKUL DETAYLARI\n` + detailsText + `${featuresText}\n\n\n` +
      `FİYAT: ${formData.price} ${formData.currency}\n\n` +
      `--------------------------------\n` +
      `${consultant.showInfo ? `Gayrimenkul Uzmanı - ${consultant.name}\nİletişim: ${consultant.phone}\n` : ''}` +
      `www.ozcanaktas.com\n\n` +
      `Ofis Adres: ${office.address}\n\n` +
      `Taşınmaz Ticareti Yetki Belge No: ${office.authNo}\n` +
      `www.emlaknomi.com\n\n` +
      `\nŞubeler: Karaman - Konya - Ereğli - Eskişehir - Alanya - Balıkesir - Kıbrıs`;

    setFormData((prev: any) => ({ ...prev, description: desc }));
  };

  const handleDownloadProject = async () => {
    if (!(window as any).JSZip) { alert("Kütüphaneler Yüklenmedi. Lütfen sayfayı yenileyin."); return; }
    setIsDownloading(true);
    
    try {
      const zip = new (window as any).JSZip();
      
      let safeNeighborhood = (formData.neighborhood || "Genel").trim()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/Ğ/g, 'G').replace(/Ü/g, 'U').replace(/Ş/g, 'S').replace(/İ/g, 'I').replace(/Ö/g, 'O').replace(/Ç/g, 'C');

      let fileDetail = formData.konutTipi ? (formData.rooms || "Konut") : (formData.arsaTipi || getSubTypeLabel() || formData.type);
      fileDetail = fileDetail.replace(/[\/\\?%*:|"<>]/g, '').trim();
      const safePrice = (formData.price || "0").replace(/[^0-9]/g, '');
      const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const folderName = `${dateStamp}_${safeNeighborhood}_${fileDetail}_${safePrice}TL`.replace(/\s+/g, '_');
      
      const rootFolder = zip.folder(folderName);
      const hamFolder = rootFolder.folder("1_HAM_FOTOLAR");
      
      if (formData.images.length > 0) {
        const imgPromises = formData.images.map(async (imgUrl: string, idx: number) => {
          try {
            const response = await fetch(imgUrl);
            const blob = await response.blob();
            hamFolder.file(`resim_${idx + 1}.jpg`, blob);
          } catch (e) {}
        });
        await Promise.all(imgPromises);
      }
      
      const metinFolder = rootFolder.folder("3_ILAN_METNI");
      metinFolder.file("ilan_metni.txt", formData.description || "Lütfen 'Sihirli Metin Oluştur' butonuna basınız.");

      const ozelFolder = rootFolder.folder("4_OZEL_BILGI");
      const ozelContent = `MÜŞTERİ BİLGİ FORMU\nTarih: ${privateData.date}\nMüşteri Adı: ${privateData.customerName}\nİletişim: ${privateData.contactInfo}\nAçık Adres: ${privateData.openAddress}\nTaşınmaz No: ${privateData.propertyNo}\nKapı Şifresi: ${privateData.doorCode}\nTapu Durumu: ${privateData.deedStatusPrivate}\nTakas: ${privateData.swapPrivate}\nBiter Fiyat: ${privateData.finalPrice}\nKomisyon: ${privateData.commission}\nNotlar: ${privateData.notes}`;
      ozelFolder.file("Ozel_Bilgiler.txt", ozelContent);
      
      const content = await zip.generateAsync({ type: "blob" });
      (window as any).saveAs(content, `${folderName}.zip`);

    } catch (error: any) {
      console.error("ZIP Oluşturma Hatası:", error);
      alert("İndirme sırasında bir hata oluştu: " + error.message);
    } finally {
      setIsDownloading(false);
    }
  };

  // --- INPUT VE SELECT BİLEŞENLERİ ---
  const InputField = ({ label, name, value, onChange, onBlur, placeholder }: any) => (
    <div className="mb-2">
      <label className="text-xs text-slate-500 block mb-1">{label}</label>
      <input name={name} value={value || ''} onChange={onChange} onBlur={onBlur} placeholder={placeholder} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none" />
    </div>
  );

  const SelectField = ({ label, name, value, onChange, opts }: any) => (
    <div className="mb-2">
      <label className="text-xs text-slate-500 block mb-1">{label}</label>
      <select name={name} value={value || ''} onChange={onChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none">
        <option value="">Seçiniz</option>
        {opts.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const MultiSelectField = ({ label, field, value, opts }: any) => (
    <div className="mb-2">
      <label className="text-xs text-slate-500 block mb-1">{label} (Çoklu)</label>
      <div className="bg-slate-50 border border-slate-200 rounded-lg max-h-28 overflow-y-auto">
        {opts.map((op: string) => (
          <div key={op} onClick={() => handleMultiSelect(field, op)} className={`flex items-center p-1.5 hover:bg-slate-100 cursor-pointer border-b border-slate-100 last:border-0 text-xs ${value?.includes(op) ? 'font-bold bg-orange-50 text-orange-600' : ''}`}>
            <span className={`w-3 h-3 rounded-full mr-2 border ${value?.includes(op) ? 'bg-orange-500 border-orange-500' : 'border-slate-300'}`}></span>
            {op}
          </div>
        ))}
      </div>
    </div>
  );

  // --- SOSYAL MEDYA TASARIM ---
  const SocialDesign = () => {
    const imgs = formData.images;
    const defaultImg = placeholderImage;

    const renderImages = () => {
      if (designMode === 'single' || imgs.length === 0) {
        return <img src={imgs.length > 0 ? imgs[formData.coverImageIndex] : defaultImg} alt="" className="w-full h-full object-cover" />;
      }
      if (designMode === 'double') {
        return (
          <div className="grid grid-cols-2 h-full">
            <img src={imgs[0] || defaultImg} alt="" className="w-full h-full object-cover" />
            <img src={imgs[1] || defaultImg} alt="" className="w-full h-full object-cover" />
          </div>
        );
      }
      if (designMode === 'triple') {
        return (
          <div className="grid grid-cols-2 h-full">
            <img src={imgs[0] || defaultImg} alt="" className="w-full h-full object-cover row-span-2" />
            <div className="grid grid-rows-2">
              <img src={imgs[1] || defaultImg} alt="" className="w-full h-full object-cover" />
              <img src={imgs[2] || defaultImg} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        );
      }
      if (designMode === 'quad') {
        return (
          <div className="grid grid-cols-2 grid-rows-2 h-full">
            <img src={imgs[0] || defaultImg} alt="" className="w-full h-full object-cover" />
            <img src={imgs[1] || defaultImg} alt="" className="w-full h-full object-cover" />
            <img src={imgs[2] || defaultImg} alt="" className="w-full h-full object-cover" />
            <img src={imgs[3] || defaultImg} alt="" className="w-full h-full object-cover" />
          </div>
        );
      }
      return null;
    };

    return (
      <div className="relative w-full aspect-square overflow-hidden rounded-lg shadow-lg" style={{maxWidth: '400px'}}>
        {renderImages()}
        {showLogo && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg p-1.5 shadow-md">
            <img src={customLogo || FIXED_LOGO_URL} alt="Logo" className="h-8 w-auto" />
          </div>
        )}
        <div className="absolute top-3 right-3 text-right">
          <div className="text-white text-xs font-bold px-2 py-1 rounded shadow-md" style={{backgroundColor: themeColor}}>
            {getFullTypeLabel().toLocaleUpperCase('tr-TR')}
          </div>
          {formData.neighborhood && <div className="text-white text-[10px] mt-1 px-2 py-0.5 rounded bg-black/50">{formData.neighborhood} Mh.</div>}
          {formData.adNumber && <div className="text-white text-[9px] mt-1 px-2 py-0.5 rounded bg-black/30">No: {formData.adNumber}</div>}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <h3 className="text-white font-bold text-sm mb-1">{getGeneratedTitle()}</h3>
          <p className="text-white/80 text-xs">{formData.district} / {formData.city}</p>
          <div className="flex items-center gap-2 mt-2 text-white/90 text-[10px] flex-wrap">
            {formData.type.includes('Daire') ? (
              <>
                {formData.rooms && <span className="bg-white/20 px-1.5 py-0.5 rounded">{formData.rooms}</span>}
                {formData.size && <span className="bg-white/20 px-1.5 py-0.5 rounded">{formData.size}</span>}
                {getFloorDisplay() && <span className="bg-white/20 px-1.5 py-0.5 rounded">{getFloorDisplay()}</span>}
              </>
            ) : (
              <>
                {formData.size && <span className="bg-white/20 px-1.5 py-0.5 rounded">{formData.size}</span>}
                <span className="bg-white/20 px-1.5 py-0.5 rounded">{getSubTypeLabel()}</span>
              </>
            )}
            {['Bireysel Garaj', 'Ortak Kullanım', 'Var'].includes(formData.garage) && (
              <span className="bg-white/20 px-1.5 py-0.5 rounded">{formData.garage === "Var" ? "Otopark" : formData.garage}</span>
            )}
          </div>
          <div className="mt-2 text-lg font-bold" style={{color: themeColor}}>{formData.price} {formData.currency}</div>
          {consultant.showInfo && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20">
              <div className="flex items-center gap-2">
                {consultant.showPhoto && <img src={consultant.photo} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />}
                <div>
                  <p className="text-white text-xs font-medium">{consultant.name}</p>
                  <p className="text-white/70 text-[10px]">{consultant.phone}</p>
                </div>
              </div>
              <div className="text-right text-[9px] text-white/60">
                {showWebsiteOzcan && <p>www.ozcanaktas.com</p>}
                {showWebsiteEmlaknomi && <p>www.emlaknomi.com</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- LOADING SCREEN ---
  if (!isReady) {
    return (
      <div style={{
        position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f1f5f9', zIndex: 9999
      }}>
        <div style={{textAlign: 'center'}}>
          <div style={{width: 48, height: 48, border: '4px solid #e2e8f0', borderTopColor: '#ea580c', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px'}}></div>
          <p style={{color: '#64748b', fontSize: 14}}>Emlaknomi Pro Yükleniyor...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-slate-900 text-white sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-white/70 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
            <div>
              <h1 className="font-bold text-sm">Emlaknomi Pro - İlan Hazırla</h1>
              <p className="text-[10px] text-white/60">v2.0</p>
            </div>
          </div>
          <button onClick={handleDownloadProject} disabled={isDownloading} className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50">
            {isDownloading ? 'Hazırlanıyor...' : '📥 İndir (ZIP)'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Sol Panel - Form */}
        <div className="lg:w-1/2 p-4 overflow-y-auto" style={{maxHeight: 'calc(100vh - 60px)'}}>
          {/* Ayarlar */}
          <div className="bg-slate-800 text-white rounded-xl p-4 mb-4">
            <h2 className="font-bold text-sm mb-3">⚙️ Ayarlar</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Şube</label>
                <select value={selectedOffice} onChange={handleOfficeChange} className="w-full bg-slate-700 border-none rounded-lg p-2 text-sm">
                  <option value="eregli">Ereğli</option>
                  <option value="karaman">Karaman</option>
                  <option value="konya">Konya</option>
                  <option value="alanya">Alanya</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Tema Rengi</label>
                <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="w-full h-9 rounded cursor-pointer" />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setShowLogo(!showLogo)} className="flex-1 border border-slate-600 p-2 rounded text-xs hover:bg-slate-700">
                {showLogo ? '🙈 Logo Gizle' : '👁 Logo Göster'}
              </button>
              <label className="flex-1 border border-slate-600 p-2 rounded text-xs hover:bg-slate-700 cursor-pointer text-center">
                📤 Logo Yükle
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  if (e.target.files?.[0]) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setCustomLogo(reader.result as string);
                      localStorage.setItem('emlaknomi_custom_logo', reader.result as string);
                    };
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }} />
              </label>
            </div>
            <div className="mt-3 border-t border-slate-700 pt-3">
              <h3 className="text-xs font-bold mb-2">👤 Danışman Bilgileri</h3>
              <input name="name" value={consultant.name} onChange={handleConsultantChange} className="w-full bg-slate-700 rounded-lg p-2 text-sm mb-2" placeholder="Danışman Adı" />
              <input name="phone" value={consultant.phone} onChange={handleConsultantChange} className="w-full bg-slate-700 rounded-lg p-2 text-sm mb-2" placeholder="Telefon" />
              <div className="flex gap-2 flex-wrap text-xs">
                <label className="flex items-center gap-1"><input type="checkbox" name="showInfo" checked={consultant.showInfo} onChange={handleConsultantChange} /> Bilgileri Göster</label>
                <label className="flex items-center gap-1"><input type="checkbox" name="showPhoto" checked={consultant.showPhoto} onChange={handleConsultantChange} /> Foto Göster</label>
                <label className="cursor-pointer underline">Profil Fotosu<input type="file" accept="image/*" className="hidden" onChange={handleProfilePhotoChange} /></label>
              </div>
              <div className="flex gap-3 mt-2 text-xs">
                <label className="flex items-center gap-1"><input type="checkbox" checked={showWebsiteOzcan} onChange={(e) => setShowWebsiteOzcan(e.target.checked)} /> ozcanaktas.com</label>
                <label className="flex items-center gap-1"><input type="checkbox" checked={showWebsiteEmlaknomi} onChange={(e) => setShowWebsiteEmlaknomi(e.target.checked)} /> emlaknomi.com</label>
              </div>
            </div>
          </div>

          {/* İlan Detayları */}
          <div className="bg-white rounded-xl p-4 mb-4">
            <h2 className="font-bold text-sm mb-3">📋 İlan Detayları</h2>
            
            {/* Fotoğraf Yükleme */}
            <div className="mb-4">
              <label className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg cursor-pointer text-sm font-bold hover:bg-orange-600 w-full justify-center">
                📷 Fotoğraf Yükle
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              </label>
              <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                {formData.images.map((img: string, idx: number) => (
                  <div key={idx} className="relative flex-shrink-0 group cursor-pointer" onClick={() => setFormData((prev: any) => ({...prev, coverImageIndex: idx}))}>
                    <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg border-2" style={{borderColor: formData.coverImageIndex === idx ? themeColor : 'transparent'}} />
                    {formData.coverImageIndex === idx && <span className="absolute top-0 left-0 bg-orange-500 text-white text-[8px] px-1 rounded-br">KAPAK</span>}
                    <button onClick={(e) => removeImage(idx, e)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-4 h-4 text-[10px] opacity-0 group-hover:opacity-100">×</button>
                  </div>
                ))}
              </div>
            </div>

            <InputField label="İlan Başlığı (Opsiyonel)" name="customTitle" value={formData.customTitle} onChange={handleInputChange} placeholder="Boş bırakılırsa otomatik oluşturulur" />
            <InputField label="İlan No" name="adNumber" value={formData.adNumber} onChange={handleInputChange} placeholder="Örn: 12345" />
            
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Emlak Tipi" name="type" value={formData.type} onChange={handleInputChange} opts={["Satılık Daire", "Kiralık Daire", "Satılık Arsa", "Satılık Tarla", "Satılık Bahçe", "Satılık Ticari", "Kiralık Ticari", "Devren Satılık"]} />
              <div className="mb-2">
                <label className="text-xs text-slate-500 block mb-1">Fiyat</label>
                <div className="flex gap-2">
                  <input name="price" value={formData.price} onChange={handleInputChange} placeholder="0" className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm" />
                  <select name="currency" value={formData.currency} onChange={handleInputChange} className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm w-16">
                    <option>TL</option><option>USD</option><option>EUR</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Konum */}
            <div className="border-t border-slate-100 pt-3 mt-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-slate-600">📍 Konum</h3>
                <button onClick={() => setIsManualLocation(!isManualLocation)} className="text-xs text-blue-600 underline">{isManualLocation ? 'Listeden Seç' : 'Manuel Gir'}</button>
              </div>
              {isManualLocation ? (
                <div className="grid grid-cols-3 gap-2">
                  <select name="city" value={formData.city} onChange={handleCityChange} className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm">
                    {allCities.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <input name="district" value={formData.district} onChange={handleInputChange} placeholder="İlçe" className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm" />
                  <input name="neighborhood" value={formData.neighborhood} onChange={handleInputChange} placeholder="Mahalle" className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <select name="city" value={formData.city} onChange={handleCityChange} className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm">
                    {allCities.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <select name="district" value={formData.district} onChange={handleDistrictChange} className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm">
                    {detailedCities.includes(formData.city) ? Object.keys(locationData[formData.city] || {}).map(d => <option key={d}>{d}</option>) : <option>-</option>}
                  </select>
                  <select name="neighborhood" value={formData.neighborhood} onChange={handleInputChange} className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm">
                    {(locationData[formData.city]?.[formData.district] || []).map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* KONUT ALANLARI */}
            {(formData.type === 'Satılık Daire' || formData.type === 'Kiralık Daire') && (
              <div className="border-t border-slate-100 pt-3 mt-3">
                <h3 className="text-xs font-bold text-slate-600 mb-2">🏠 Konut Detayları</h3>
                <div className="grid grid-cols-2 gap-3">
                  <SelectField label="Konut Tipi" name="konutTipi" value={formData.konutTipi} onChange={handleInputChange} opts={options.konutTipi} />
                  <SelectField label="Oda Sayısı" name="rooms" value={formData.rooms} onChange={handleInputChange} opts={options.rooms} />
                  <InputField label="Brüt m²" name="size" value={formData.size} onChange={handleInputChange} onBlur={handleInputBlur} placeholder="Örn: 120" />
                  <InputField label="Net m²" name="netSize" value={formData.netSize} onChange={handleInputChange} onBlur={handleInputBlur} placeholder="Örn: 100" />
                  <SelectField label="Bulunduğu Kat" name="floor" value={formData.floor} onChange={handleInputChange} opts={options.floors} />
                  <SelectField label="Bina Kat Sayısı" name="totalFloors" value={formData.totalFloors} onChange={handleInputChange} opts={options.totalFloors} />
                  <SelectField label="Kattaki Daire Sayısı" name="flatCountOnFloor" value={formData.flatCountOnFloor} onChange={handleInputChange} opts={options.flatCount} />
                  <SelectField label="Kat Tipi" name="katTipi" value={formData.katTipi} onChange={handleInputChange} opts={options.katTipi} />
                  <SelectField label="Bina Yaşı" name="age" value={formData.age} onChange={handleInputChange} opts={options.age} />
                  <SelectField label="Banyo Sayısı" name="banyoSayisi" value={formData.banyoSayisi} onChange={handleInputChange} opts={options.banyoSayisi} />
                  <SelectField label="Ebeveyn Banyosu" name="masterBath" value={formData.masterBath} onChange={handleInputChange} opts={["Var", "Yok"]} />
                  <SelectField label="Tuvalet Sayısı" name="wcCount" value={formData.wcCount} onChange={handleInputChange} opts={options.wcCount} />
                  <MultiSelectField label="Tuvalet Tipi" field="tuvaletTipi" value={formData.tuvaletTipi} opts={options.tuvaletTipi} />
                  <MultiSelectField label="Isıtma Tipi" field="heating" value={formData.heating} opts={options.heating} />
                  <SelectField label="Isı Yalıtımı" name="insulation" value={formData.insulation} onChange={handleInputChange} opts={options.insulation} />
                  <SelectField label="Balkon Sayısı" name="balconyCount" value={formData.balconyCount} onChange={handleInputChange} opts={options.balcony} />
                  <SelectField label="Cam Balkon" name="glassBalcony" value={formData.glassBalcony} onChange={handleInputChange} opts={options.glassBalcony} />
                  <SelectField label="Asansör" name="elevator" value={formData.elevator} onChange={handleInputChange} opts={options.elevator} />
                  <SelectField label="İç Kapılar" name="icKapilar" value={formData.icKapilar} onChange={handleInputChange} opts={options.icKapilar} />
                  <SelectField label="Pencereler" name="pencereler" value={formData.pencereler} onChange={handleInputChange} opts={options.pencereler} />
                  <SelectField label="Zeminler" name="zeminler" value={formData.zeminler} onChange={handleInputChange} opts={options.zeminler} />
                  <SelectField label="Mutfak Dolabı" name="mutfakDolabi" value={formData.mutfakDolabi} onChange={handleInputChange} opts={options.mutfakDolabi} />
                  <SelectField label="Çelik Kapı" name="celikKapi" value={formData.celikKapi} onChange={handleInputChange} opts={["Var", "Yok"]} />
                  <MultiSelectField label="Kiler" field="pantry" value={formData.pantry} opts={options.kiler} />
                  <SelectField label="Garaj" name="garage" value={formData.garage} onChange={handleInputChange} opts={options.garage} />
                  <MultiSelectField label="Bahçe" field="bahce" value={formData.bahce} opts={options.bahce} />
                  <SelectField label="Eşyalı mı" name="esyali" value={formData.esyali} onChange={handleInputChange} opts={["Evet", "Hayır", "Kısmen"]} />
                  <SelectField label="Otopark" name="parking" value={formData.parking} onChange={handleInputChange} opts={options.parking} />
                  <MultiSelectField label="Panjur" field="panjur" value={formData.panjur} opts={options.panjur} />
                  <SelectField label="Ankastre" name="ankastre" value={formData.ankastre} onChange={handleInputChange} opts={["Var", "Yok"]} />
                  <SelectField label="Site İçi" name="siteIci" value={formData.siteIci} onChange={handleInputChange} opts={["Evet", "Hayır"]} />
                  <MultiSelectField label="Güvenlik" field="guvenlik" value={formData.guvenlik} opts={options.guvenlik} />
                  <MultiSelectField label="Aktivite" field="aktivite" value={formData.aktivite} opts={options.aktivite} />
                  <MultiSelectField label="Muhit" field="mevki" value={formData.mevki} opts={options.mevki} />
                  <InputField label="Aidat" name="aidat" value={formData.aidat} onChange={handleInputChange} placeholder="Örn: 500" />
                  <SelectField label="Tapu Durumu" name="deedStatus" value={formData.deedStatus} onChange={handleInputChange} opts={options.deed} />
                  <SelectField label="İskan" name="iskan" value={formData.iskan} onChange={handleInputChange} opts={options.iskan} />
                  <SelectField label="Kullanım Durumu" name="usageStatus" value={formData.usageStatus} onChange={handleInputChange} opts={options.usage} />
                  <SelectField label="Hisse Durumu" name="hisseDurumu" value={formData.hisseDurumu} onChange={handleInputChange} opts={options.hisse} />
                  {formData.type === 'Kiralık Daire' && (
                    <InputField label="Kira Bedeli" name="kiraBedeli" value={formData.kiraBedeli} onChange={handleInputChange} placeholder="Örn: 15.000" />
                  )}
                  {formData.type === 'Satılık Daire' && (
                    <>
                      <SelectField label="Krediye Uygun" name="creditSuitable" value={formData.creditSuitable} onChange={handleInputChange} opts={options.credit} />
                      <SelectField label="Takas" name="swapAvailable" value={formData.swapAvailable} onChange={handleInputChange} opts={options.swap} />
                    </>
                  )}
                  <MultiSelectField label="Cephe" field="facade" value={formData.facade} opts={options.facade} />
                </div>
              </div>
            )}

            {/* ARSA ALANLARI */}
            {formData.type === 'Satılık Arsa' && (
              <div className="border-t border-slate-100 pt-3 mt-3">
                <h3 className="text-xs font-bold text-slate-600 mb-2">🏗️ Arsa Detayları</h3>
                <div className="grid grid-cols-2 gap-3">
                  <SelectField label="Arsa Tipi" name="arsaTipi" value={formData.arsaTipi} onChange={handleInputChange} opts={options.arsaTipi} />
                  <SelectField label="İmar Durumu" name="imarDurumu" value={formData.imarDurumu} onChange={handleInputChange} opts={options.imarDurumu} />
                  <InputField label="Ada/Parsel" name="adaParsel" value={formData.adaParsel} onChange={handleInputChange} placeholder="Örn: 123/45" />
                  <InputField label="Metrekare" name="size" value={formData.size} onChange={handleInputChange} onBlur={handleInputBlur} placeholder="Örn: 500" />
                  <InputField label="T.A.K.S." name="taks" value={formData.taks} onChange={handleInputChange} placeholder="Örn: 0.30" />
                  <InputField label="K.A.K.S." name="kaks" value={formData.kaks} onChange={handleInputChange} placeholder="Örn: 1.50" />
                  <SelectField label="Nizam" name="nizam" value={formData.nizam} onChange={handleInputChange} opts={options.nizam} />
                  <MultiSelectField label="Alt Yapı" field="altYapi" value={formData.altYapi} opts={options.altYapi} />
                  <SelectField label="Krediye Uygun" name="creditSuitable" value={formData.creditSuitable} onChange={handleInputChange} opts={options.credit} />
                  <SelectField label="Takas" name="swapAvailable" value={formData.swapAvailable} onChange={handleInputChange} opts={options.swap} />
                </div>
              </div>
            )}

            {/* TARLA/BAHÇE ALANLARI */}
            {(formData.type === 'Satılık Tarla' || formData.type === 'Satılık Bahçe') && (
              <div className="border-t border-slate-100 pt-3 mt-3">
                <h3 className="text-xs font-bold text-slate-600 mb-2">🌾 Tarla/Bahçe Detayları</h3>
                <div className="grid grid-cols-2 gap-3">
                  {formData.type === 'Satılık Tarla' && <MultiSelectField label="Tarla Tipi" field="tarlaTipi" value={formData.tarlaTipi} opts={options.tarlaTipi} />}
                  {formData.type === 'Satılık Bahçe' && <SelectField label="Bahçe Tipi" name="bahceTipi" value={formData.bahceTipi} onChange={handleInputChange} opts={options.bahceTipi} />}
                  <InputField label="Ada/Parsel" name="adaParsel" value={formData.adaParsel} onChange={handleInputChange} placeholder="Örn: 123/45" />
                  <InputField label="Metrekare" name="size" value={formData.size} onChange={handleInputChange} onBlur={handleInputBlur} placeholder="Örn: 5000" />
                  <MultiSelectField label="Su Durumu" field="suDurumu" value={formData.suDurumu} opts={options.suDurumu} />
                  <SelectField label="Elektrik Durumu" name="elektrikDurumu" value={formData.elektrikDurumu} onChange={handleInputChange} opts={options.elektrikDurumu} />
                  <MultiSelectField label="Yol Durumu" field="yolDurumu" value={formData.yolDurumu} opts={options.yolDurumu} />
                  <MultiSelectField label="Ev Durumu" field="evDurumu" value={formData.evDurumu} opts={options.evDurumu} />
                  <SelectField label="Havuz Durumu" name="havuzDurumu" value={formData.havuzDurumu} onChange={handleInputChange} opts={options.havuzDurumu} />
                  <SelectField label="Hisse Durumu" name="hisseDurumu" value={formData.hisseDurumu} onChange={handleInputChange} opts={options.hisse} />
                </div>
              </div>
            )}

            {/* TİCARİ ALANLAR */}
            {(formData.type === 'Satılık Ticari' || formData.type === 'Kiralık Ticari' || formData.type === 'Devren Satılık') && (
              <div className="border-t border-slate-100 pt-3 mt-3">
                <h3 className="text-xs font-bold text-slate-600 mb-2">🏢 Ticari Detaylar</h3>
                <div className="grid grid-cols-2 gap-3">
                  <SelectField label="Gayrimenkul Tipi" name="gayrimenkulTipi" value={formData.gayrimenkulTipi} onChange={handleInputChange} opts={options.ticariTipi} />
                  <InputField label="Metrekare" name="size" value={formData.size} onChange={handleInputChange} onBlur={handleInputBlur} placeholder="Örn: 150" />
                  <MultiSelectField label="Kat Sayısı" field="katSayisiTicari" value={formData.katSayisiTicari} opts={options.katSayisiTicari} />
                  <MultiSelectField label="Muhit" field="mevki" value={formData.mevki} opts={options.mevki} />
                </div>
              </div>
            )}

            <InputField label="Diğer Özellikler (Metin)" name="digerOzellikler" value={formData.digerOzellikler} onChange={handleInputChange} placeholder="Ekstra not..." />

            {/* Özellikler */}
            <div className="border-t border-slate-100 pt-3 mt-3">
              <h3 className="text-xs font-bold text-slate-600 mb-2">✨ Özellikler</h3>
              {Object.keys(featureCategories).map((cat) => (
                <div key={cat} className="mb-2">
                  <button onClick={() => toggleCategory(cat)} className="w-full p-2 bg-slate-50 text-left text-xs font-bold flex justify-between rounded-lg hover:bg-slate-100">
                    {cat} <span>{openCategories[cat] ? '▲' : '▼'}</span>
                  </button>
                  {openCategories[cat] && (
                    <div className="flex flex-wrap gap-1 mt-2 p-2 bg-slate-50 rounded-lg">
                      {featureCategories[cat].map(f => (
                        <button key={f} onClick={() => handleFeatureToggle(f)} className={`px-2 py-1 border rounded text-[10px] transition-colors ${formData.features.includes(f) ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-slate-200 hover:bg-slate-100'}`}>
                          {f}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button onClick={generateDescription} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold text-sm mt-4 hover:bg-slate-700">
              ✨ Sihirli Metin Oluştur
            </button>
          </div>

          {/* Gizli Bilgiler */}
          <div className="bg-white rounded-xl p-4 mb-4">
            <h2 className="font-bold text-sm mb-3">🔒 Gizli Bilgiler (Sadece Size)</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="mb-2">
                <label className="text-xs text-slate-500 block mb-1">Tarih</label>
                <input type="date" name="date" value={privateData.date} onChange={handlePrivateInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm" />
              </div>
              <InputField label="Müşteri Adı" name="customerName" value={privateData.customerName} onChange={handlePrivateInputChange} placeholder="" />
              <InputField label="İletişim Bilgisi" name="contactInfo" value={privateData.contactInfo} onChange={handlePrivateInputChange} placeholder="" />
              <InputField label="Açık Adres" name="openAddress" value={privateData.openAddress} onChange={handlePrivateInputChange} placeholder="" />
              <InputField label="Biter Fiyat" name="finalPrice" value={privateData.finalPrice} onChange={handlePrivateInputChange} placeholder="" />
              <InputField label="Komisyon" name="commission" value={privateData.commission} onChange={handlePrivateInputChange} placeholder="" />
            </div>
          </div>
        </div>

        {/* Sağ Panel - Önizleme */}
        <div className="lg:w-1/2 p-4 bg-slate-200 overflow-y-auto" style={{maxHeight: 'calc(100vh - 60px)'}}>
          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="flex gap-2 mb-4">
              <button onClick={() => setActiveTab('social')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'social' ? 'bg-orange-500 text-white' : 'text-slate-500 bg-slate-100'}`}>
                📱 Sosyal Medya
              </button>
              <button onClick={() => setActiveTab('whatsapp')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'whatsapp' ? 'bg-green-500 text-white' : 'text-slate-500 bg-slate-100'}`}>
                💬 WhatsApp
              </button>
            </div>

            {activeTab === 'social' && (
              <>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-slate-600">INSTAGRAM (1080x1080)</span>
                </div>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {['single', 'double', 'triple', 'quad'].map(mode => (
                    <button key={mode} onClick={() => setDesignMode(mode)} className={`px-3 py-1 text-xs font-bold border rounded-lg transition-colors ${designMode === mode ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border-slate-200'}`}>
                      {mode === 'single' ? 'Tekli' : mode === 'double' ? 'İkili' : mode === 'triple' ? 'Üçlü' : 'Dörtlü'}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center">
                  <SocialDesign />
                </div>
              </>
            )}

            {activeTab === 'whatsapp' && (
              <>
                <span className="text-xs font-bold text-slate-600 block mb-3">WHATSAPP METNİ</span>
                <textarea readOnly value={formData.description} className="w-full h-64 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono" />
                <button onClick={() => copyToClipboard(formData.description)} className="mt-3 w-full py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700">
                  📋 Kopyala
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
