"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// --- TYPES ---
interface Item {
  id: number;
  adNo: number;
  text: string;
  phone: string;
  contactName: string;
  date: string;
  price: number;
  alarmTime: string;
  alarmActive: boolean;
  tags: string[];
  cityId: string | null;
  cityName: string;
  dealType: string;
}

interface Category {
  id: string;
  title: string;
  keywords: string;
  items: Item[];
  icon: string;
}

interface City {
  id: string;
  title: string;
  keywords: string;
}

// --- VARSAYILAN VERİLER ---
const defaultCategories: Category[] = [
  { id: 'cat_randevu', title: 'Randevular', keywords: 'randevu,görüşme,buluşma,toplantı,yarın,saat,gösterilecek,gösterim,sunum,bakılacak', items: [], icon: 'calendar' },
  { id: 'cat_todo', title: 'Yapılacaklar', keywords: 'yapılacak,hatırlat,alınacak,git,gel,ara,sor,gönder,hazırla,not', items: [], icon: 'check' },
  { id: 'cat_konut', title: 'Konut', keywords: 'ev,daire,konut,villa,yalı,rezidans,bina,site,kat,apartman,stüdyo', items: [], icon: 'home' },
  { id: 'cat_ticari', title: 'Ticari', keywords: 'ofis,dükkan,depo,işyeri,plaza,mağaza,fabrika,imalathane,büro', items: [], icon: 'store' },
  { id: 'cat_devren', title: 'Devren', keywords: 'devren,devir,devredilecek,isim hakkı', items: [], icon: 'key' },
  { id: 'cat_arsa', title: 'Arsa', keywords: 'arsa,arazi,parsel,imarlı,yatırım,metrekare,tek tapu,hisseli,ifrazlı', items: [], icon: 'map' },
  { id: 'cat_tarla', title: 'Tarla', keywords: 'tarla,ekim,biçim,sulak,kuru,dönüm,tarım', items: [], icon: 'sprout' },
  { id: 'cat_bahce', title: 'Bahçe', keywords: 'bahçe,meyve,ağaç,fidan,hobi bahçesi,bağ', items: [], icon: 'flower' }
];

const defaultCities: City[] = [
  { id: 'city_eregli', title: 'Ereğli', keywords: 'ereğli,toros,toros mahallesi,toki,organize' },
  { id: 'city_konya', title: 'Konya', keywords: 'konya,meram,selçuklu,karatay,bosna' },
  { id: 'city_karaman', title: 'Karaman', keywords: 'karaman,ermenek' },
  { id: 'city_alanya', title: 'Alanya', keywords: 'alanya,mahmutlar,kestel' },
  { id: 'city_eskisehir', title: 'Eskişehir', keywords: 'eskişehir,odunpazarı,tepebaşı' }
];

const defaultTags = ["1+1", "2+1", "3+1", "4+1", "Müstakil", "Eşyalı", "Yatırımlık", "Garajlı", "Site İçinde", "Ara Kat", "Zemin Kat", "Güney Cephe", "Kuzey Cephe", "Sıfır"];

export default function TalepGirPage() {
  const [isReady, setIsReady] = useState(false);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [cities, setCities] = useState<City[]>(defaultCities);
  const [availableTags, setAvailableTags] = useState(defaultTags);
  const [lastAdNumber, setLastAdNumber] = useState(1000);

  const [activeTabId, setActiveTabId] = useState('cat_randevu');
  const [activeCityFilter, setActiveCityFilter] = useState('all');
  const [activeDealType, setActiveDealType] = useState('all');
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState('date_desc');
  const [priceFilter, setPriceFilter] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [isCalendarView, setIsCalendarView] = useState(false);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [viewingDayDate, setViewingDayDate] = useState<Date | null>(null);
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date | null>(null);
  const [calendarInputText, setCalendarInputText] = useState('');

  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Modal States
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showTagManagerModal, setShowTagManagerModal] = useState(false);
  const [showCityManagerModal, setShowCityManagerModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Form States
  const [editingCategoryData, setEditingCategoryData] = useState({ id: '', title: '', keywords: '' });
  const [newCatTitle, setNewCatTitle] = useState('');
  const [newCatKeywords, setNewCatKeywords] = useState('');
  const [newCityTitle, setNewCityTitle] = useState('');
  const [newCityKeywords, setNewCityKeywords] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [importTarget, setImportTarget] = useState('auto');

  const alarmSound = useRef<HTMLAudioElement | null>(null);

  // Load Tailwind and data
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

    loadScript('https://cdn.tailwindcss.com').then(() => {
      const checkTailwind = setInterval(() => {
        if ((window as any).tailwind) {
          clearInterval(checkTailwind);
          setIsReady(true);
        }
      }, 50);
      setTimeout(() => { clearInterval(checkTailwind); setIsReady(true); }, 2000);
    });

    // Load saved data
    const saved = localStorage.getItem('talepgir_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.categories) setCategories(data.categories);
        if (data.cities) setCities(data.cities);
        if (data.tags) setAvailableTags(data.tags);
        if (data.lastAdNumber) setLastAdNumber(data.lastAdNumber);
      } catch (e) {}
    }

    try {
      alarmSound.current = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    } catch(e) {}

    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Alarm check
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      categories.forEach(cat => {
        cat.items.forEach((item: any) => {
          if (item.alarmActive && item.alarmTime) {
            const diff = now.getTime() - new Date(item.alarmTime).getTime();
            if (diff >= 0 && diff < 60000) triggerNotification(item.text);
          }
        });
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [categories]);

  const saveData = (newCategories: any[], newCities: any[], newTags: string[], newAdNumber: number) => {
    localStorage.setItem('talepgir_data', JSON.stringify({
      categories: newCategories,
      cities: newCities,
      tags: newTags,
      lastAdNumber: newAdNumber
    }));
  };

  const triggerNotification = (text: string) => {
    if(alarmSound.current) alarmSound.current.play().catch(e=>console.log(e));
    if (Notification.permission === "granted") {
      new Notification("Emlak Asistanı", { body: text, icon: 'https://i.hizliresim.com/arpast7.jpeg' });
    }
  };

  const testAlarm = () => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then(p => { if(p==="granted") triggerNotification("Test Başarılı!"); else alert("İzin verilmedi."); });
    } else triggerNotification("Test Başarılı!");
  };

  const extractInfo = (text: string) => {
    const phoneRegex = /(0?5\d{2})[\s-]?(\d{3})[\s-]?(\d{2})[\s-]?(\d{2})|(\d{10,11})/;
    const phoneMatch = text.match(phoneRegex);
    let phone = phoneMatch ? phoneMatch[0] : '';
    
    let price = 0;
    const lowerText = text.toLocaleLowerCase('tr-TR');
    const millionMatch = lowerText.match(/(\d+([.,]\d+)?)\s*milyon/);
    if (millionMatch) price = parseFloat(millionMatch[1].replace(',', '.')) * 1000000;
    else {
      const thousandMatch = lowerText.match(/(\d+([.,]\d+)?)\s*bin/);
      if (thousandMatch) price = parseFloat(thousandMatch[1].replace(',', '.')) * 1000;
    }
    return { phone, text, price };
  };

  const parseDateFromText = (text: string) => {
    const now = new Date();
    const lower = text.toLocaleLowerCase('tr-TR');
    let targetDate = new Date();
    let found = false;

    const days = ['pazar', 'pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma', 'cumartesi'];
    const currentDayIndex = now.getDay();
    let targetDayIndex = -1;

    for (let i = 0; i < days.length; i++) {
      if (lower.includes(days[i])) { targetDayIndex = i; found = true; break; }
    }

    let addWeeks = 0;
    if (lower.includes('haftaya') || lower.includes('gelecek') || lower.includes('önümüzdeki')) { addWeeks = 1; found = true; }

    if (lower.includes('yarın')) { targetDate.setDate(targetDate.getDate() + 1); found = true; }
    else if (targetDayIndex !== -1) {
      let diff = targetDayIndex - currentDayIndex;
      if (diff <= 0) diff += 7;
      targetDate.setDate(targetDate.getDate() + diff + (addWeeks * 7));
    } else if (addWeeks > 0) { targetDate.setDate(targetDate.getDate() + 7); }

    let hours = 9, minutes = 0, timeFound = false;
    const explicitTime = lower.match(/(\d{1,2})[.:](\d{2})/);
    if (explicitTime) { hours = parseInt(explicitTime[1]); minutes = parseInt(explicitTime[2]); timeFound = true; }
    else {
      const suffixTime = lower.match(/(\d{1,2})\s*(?:'|')?\s*(?:de|da|te|ta)\b/);
      const saatWordTime = lower.match(/saat\s*(\d{1,2})/);
      if (suffixTime) { hours = parseInt(suffixTime[1]); timeFound = true; }
      else if (saatWordTime) { hours = parseInt(saatWordTime[1]); timeFound = true; }
    }

    if (timeFound) {
      if (hours < 8 && !lower.includes('sabah') && !lower.includes('gece')) hours += 12;
      targetDate.setHours(hours, minutes, 0, 0);
      found = true;
    } else { targetDate.setHours(9, 0, 0, 0); }

    if (found) {
      const y = targetDate.getFullYear();
      const m = String(targetDate.getMonth() + 1).padStart(2, '0');
      const d = String(targetDate.getDate()).padStart(2, '0');
      const h = String(targetDate.getHours()).padStart(2, '0');
      const min = String(targetDate.getMinutes()).padStart(2, '0');
      return `${y}-${m}-${d}T${h}:${min}`;
    }
    return null;
  };

  const processCommand = (rawText: string, forcedDate: Date | null = null) => {
    if (!rawText.trim()) return;

    let textToProcess = rawText.replace(/(\d)\s*\+\s*(\d)/g, '$1+$2');
    const now = new Date();
    const fullDate = `${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
    const timestamp = Date.now();
    const lowerText = textToProcess.toLocaleLowerCase('tr-TR');
    let { phone, text, price } = extractInfo(textToProcess);

    let detectedCityId = null, detectedCityName = '';
    for (const city of cities) {
      const cityKeys = city.keywords.split(',').map(k => k.trim().toLocaleLowerCase('tr-TR')).filter(k => k !== '');
      if (cityKeys.some(key => lowerText.includes(key))) { detectedCityId = city.id; detectedCityName = city.title; break; }
    }

    let dealType = 'sale';
    if (lowerText.includes('kiralık') || lowerText.includes('kira')) dealType = 'rent';

    const detectedTags = availableTags.filter(tag => lowerText.includes(tag.toLocaleLowerCase('tr-TR')));
    const newAdNo = lastAdNumber + 1;

    let alarmTime = '', alarmActive = false;
    if (forcedDate) {
      const d = new Date(forcedDate); d.setHours(9, 0, 0, 0);
      alarmTime = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T09:00`;
      alarmActive = true;
    } else {
      const detectedDate = parseDateFromText(textToProcess);
      if (detectedDate) { alarmTime = detectedDate; alarmActive = true; }
    }

    const newItem = { id: timestamp, adNo: newAdNo, text, phone, contactName: '', date: fullDate, price, alarmTime, alarmActive, tags: detectedTags, cityId: detectedCityId, cityName: detectedCityName, dealType };

    let targetCategoryId = 'cat_todo';
    const appointmentTriggers = ['randevu', 'gösterim', 'gösterilecek', 'sunum', 'yarın', 'saat', 'toplantı', 'haftaya', 'gün'];
    const isAppointment = appointmentTriggers.some(trigger => lowerText.includes(trigger));

    if (alarmActive || isAppointment) targetCategoryId = 'cat_randevu';
    else if (lowerText.includes('devren')) targetCategoryId = 'cat_devren';
    else {
      const priorityOrder = ['cat_ticari', 'cat_tarla', 'cat_bahce', 'cat_arsa', 'cat_konut'];
      for (const catId of priorityOrder) {
        const cat = categories.find(c => c.id === catId);
        if (cat) {
          const keys = cat.keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k !== '');
          if (keys.some(key => lowerText.includes(key))) { targetCategoryId = catId; break; }
        }
      }
    }

    const newCategories = categories.map(c => c.id === targetCategoryId ? { ...c, items: [newItem, ...c.items] } : c);
    setCategories(newCategories);
    setLastAdNumber(newAdNo);
    saveData(newCategories, cities, availableTags, newAdNo);

    const targetCategory = categories.find(c => c.id === targetCategoryId);
    setFeedbackMsg(`✅ #${newAdNo} - "${targetCategory?.title}" eklendi.`);
    setActiveTabId(targetCategoryId);
    if (detectedCityId) setActiveCityFilter(detectedCityId);
    setInputText('');
    setTimeout(() => setFeedbackMsg(''), 3000);

    if (targetCategoryId === 'cat_randevu') addToGoogleCalendar(newItem);
  };

  const addToGoogleCalendar = (item: any) => {
    let targetDate = item.alarmTime ? new Date(item.alarmTime) : new Date();
    if (!item.alarmTime) { targetDate.setHours(targetDate.getHours() + 1); targetDate.setMinutes(0); }
    const startDate = targetDate;
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Randevu: " + (item.contactName || "Müşteri"))}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(item.text + "\nTel: " + (item.phone || '-'))}`;
    window.open(url, '_blank');
  };

  const deleteItem = (catId: string, itemId: number) => {
    if (!confirm("Silmek istediğinize emin misiniz?")) return;
    const newCategories = categories.map(c => c.id === catId ? { ...c, items: c.items.filter((i: any) => i.id !== itemId) } : c);
    setCategories(newCategories);
    saveData(newCategories, cities, availableTags, lastAdNumber);
  };

  const saveItemChanges = () => {
    if (!editingItem) return;
    let newCategories = [...categories];
    const { originalCatId, targetCatId, item } = editingItem;

    if (originalCatId === targetCatId) {
      newCategories = newCategories.map(c => c.id === originalCatId ? { ...c, items: c.items.map((i: any) => i.id === item.id ? item : i) } : c);
    } else {
      newCategories = newCategories.map(c => c.id === originalCatId ? { ...c, items: c.items.filter((i: any) => i.id !== item.id) } : c);
      newCategories = newCategories.map(c => c.id === targetCatId ? { ...c, items: [item, ...c.items] } : c);
    }

    setCategories(newCategories);
    saveData(newCategories, cities, availableTags, lastAdNumber);
    setEditingItem(null);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Ses desteği yok.");
    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInputText(transcript);
      processCommand(transcript);
    };
    recognition.start();
  };

  const getProcessedItems = (items: any[]) => {
    let result = [...items];
    if (activeCityFilter !== 'all') result = result.filter(item => item.cityId === activeCityFilter);
    if (activeDealType !== 'all' && activeTabId !== 'cat_todo' && activeTabId !== 'cat_randevu') result = result.filter(item => item.dealType === activeDealType);
    if (activeFilters.length > 0) result = result.filter(item => activeFilters.every(filterTag => item.tags && item.tags.includes(filterTag)));
    if (priceFilter.min !== '') result = result.filter(item => item.price >= parseFloat(priceFilter.min));
    if (priceFilter.max !== '') result = result.filter(item => item.price <= parseFloat(priceFilter.max));

    result.sort((a, b) => {
      switch (sortOption) {
        case 'date_asc': return a.id - b.id;
        case 'date_desc': return b.id - a.id;
        case 'price_asc': if (!a.price) return 1; if (!b.price) return -1; return a.price - b.price;
        case 'price_desc': if (!a.price) return 1; if (!b.price) return -1; return b.price - a.price;
        default: return b.id - a.id;
      }
    });
    return result;
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return '';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(amount);
  };

  const toggleFilter = (tag: string) => {
    if (activeFilters.includes(tag)) setActiveFilters(activeFilters.filter(t => t !== tag));
    else setActiveFilters([...activeFilters, tag]);
  };

  const downloadAllData = () => {
    let allItems: any[] = [];
    categories.forEach(cat => { if (cat.items.length > 0) allItems = [...allItems, ...cat.items]; });
    allItems.sort((a, b) => (b.adNo || 0) - (a.adNo || 0));

    let fullContent = `TÜM VERİLER - ${new Date().toLocaleString('tr-TR')}\r\n\r\n`;
    categories.forEach(cat => {
      if (cat.items.length > 0) {
        fullContent += `>>> ${cat.title.toUpperCase()} <<<\r\n`;
        const sortedItems = [...cat.items].sort((a: any, b: any) => (b.adNo || 0) - (a.adNo || 0));
        sortedItems.forEach((item: any) => {
          fullContent += `#${item.adNo || '-'} | ${item.date} | ${item.cityName || ''}\r\n${item.text}\r\nKişi: ${item.contactName || '-'} (${item.phone || '-'})\r\nFiyat: ${formatCurrency(item.price)}\r\n---\r\n`;
        });
      }
    });

    if (allItems.length === 0) return alert("Kayıt yok.");
    downloadFile(fullContent, `Tum_Kayitlar.txt`);
    setShowMenu(false);
  };

  const downloadFilteredData = () => {
    const activeCategory = categories.find(c => c.id === activeTabId) || categories[0];
    const filteredItems = getProcessedItems(activeCategory.items);
    if (filteredItems.length === 0) { alert("Veri yok."); return; }
    filteredItems.sort((a, b) => (b.adNo || 0) - (a.adNo || 0));

    let content = `${activeCategory.title.toUpperCase()} RAPORU - ${new Date().toLocaleString('tr-TR')}\r\n\r\n`;
    filteredItems.forEach((item) => {
      content += `#${item.adNo || '-'} | ${item.cityName || ''} | ${item.dealType === 'rent' ? 'KİRA' : 'SATILIK'}\r\n${item.text}\r\nFiyat: ${formatCurrency(item.price)}\r\n---\r\n`;
    });
    downloadFile(content, `${activeCategory.title}_Raporu.txt`);
    setShowMenu(false);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob(["\uFEFF" + content], { type: 'text/plain;charset=utf-8' });
    const element = document.createElement("a");
    element.href = URL.createObjectURL(blob);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const content = ev.target?.result as string;
      const lines = content.split(/\r?\n/);
      let importedCount = 0;
      let currentAdNo = lastAdNumber;
      let tempCategories = [...categories];

      lines.forEach(line => {
        if (!line.trim()) return;
        let cleanText = line.replace(/^[\d-]+\.?\s*/, '').trim();
        if (!cleanText) return;
        let { phone, text, price } = extractInfo(cleanText);
        const now = new Date();
        const fullDate = `${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
        const detectedTags = availableTags.filter(tag => cleanText.toLocaleLowerCase('tr-TR').includes(tag.toLocaleLowerCase('tr-TR')));
        
        let detectedCityId = null, detectedCityName = '';
        for (const city of cities) {
          if (city.keywords.split(',').map(k => k.trim()).some(k => cleanText.toLowerCase().includes(k))) {
            detectedCityId = city.id;
            detectedCityName = city.title;
            break;
          }
        }
        
        let dealType = 'sale';
        if (cleanText.toLowerCase().includes('kira')) dealType = 'rent';

        let targetCatId = 'cat_todo';
        if (importTarget !== 'auto') targetCatId = importTarget;
        else {
          const priorityOrder = ['cat_devren', 'cat_ticari', 'cat_tarla', 'cat_bahce', 'cat_arsa', 'cat_konut', 'cat_randevu'];
          for (const catId of priorityOrder) {
            const cat = tempCategories.find(c => c.id === catId);
            if (cat && cat.keywords.split(',').some(k => cleanText.toLowerCase().includes(k.trim()))) {
              targetCatId = cat.id;
              break;
            }
          }
        }

        currentAdNo++;
        const newItem = { id: Date.now() + Math.random(), adNo: currentAdNo, text: cleanText, phone, contactName: '', date: fullDate, price, alarmTime: '', alarmActive: false, tags: detectedTags, cityId: detectedCityId, cityName: detectedCityName, dealType };
        tempCategories = tempCategories.map(c => c.id === targetCatId ? { ...c, items: [newItem, ...c.items] } : c);
        importedCount++;
      });

      setCategories(tempCategories);
      setLastAdNumber(currentAdNo);
      saveData(tempCategories, cities, availableTags, currentAdNo);
      setFeedbackMsg(`${importedCount} kayıt yüklendi!`);
      setShowImportModal(false);
    };
    reader.readAsText(file, "UTF-8");
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    const days: (Date | null)[] = [];
    for (let i = 0; i < adjustedFirstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const addNewCity = () => {
    if (!newCityTitle) return;
    const newCities = [...cities, { id: `city_${Date.now()}`, title: newCityTitle, keywords: newCityKeywords }];
    setCities(newCities);
    saveData(categories, newCities, availableTags, lastAdNumber);
    setNewCityTitle('');
    setNewCityKeywords('');
  };

  const removeCity = (cityId: string) => {
    if (confirm("Silinsin mi?")) {
      const newCities = cities.filter(c => c.id !== cityId);
      setCities(newCities);
      saveData(categories, newCities, availableTags, lastAdNumber);
    }
  };

  const addNewCategory = () => {
    if (!newCatTitle) return;
    const newCategories = [...categories, { id: `cat_${Date.now()}`, title: newCatTitle, keywords: newCatKeywords, items: [], icon: 'briefcase' }];
    setCategories(newCategories);
    saveData(newCategories, cities, availableTags, lastAdNumber);
    setShowAddCategoryModal(false);
    setNewCatTitle('');
    setNewCatKeywords('');
  };

  const saveCategory = () => {
    const newCategories = categories.map(c => c.id === editingCategoryData.id ? { ...c, title: editingCategoryData.title, keywords: editingCategoryData.keywords } : c);
    setCategories(newCategories);
    saveData(newCategories, cities, availableTags, lastAdNumber);
    setShowEditCategoryModal(false);
  };

  const deleteCategory = () => {
    if (categories.length <= 1) return alert("Silinemez");
    const newCategories = categories.filter(c => c.id !== editingCategoryData.id);
    setCategories(newCategories);
    saveData(newCategories, cities, availableTags, lastAdNumber);
    setShowEditCategoryModal(false);
    setActiveTabId(newCategories[0].id);
  };

  const addNewTag = () => {
    if (newTagName && !availableTags.includes(newTagName)) {
      const newTags = [...availableTags, newTagName];
      setAvailableTags(newTags);
      saveData(categories, cities, newTags, lastAdNumber);
      setNewTagName('');
    }
  };

  const removeTag = (tag: string) => {
    const newTags = availableTags.filter(t => t !== tag);
    setAvailableTags(newTags);
    saveData(categories, cities, newTags, lastAdNumber);
  };

  // --- LOADING SCREEN ---
  if (!isReady) {
    return (
      <div style={{
        position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f8fafc', zIndex: 9999
      }}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: 48, color: '#f97316', animation: 'pulse 1s infinite'}}>●</div>
          <p style={{color: '#64748b', fontSize: 14, marginTop: 8}}>Talep Asistanı Yükleniyor...</p>
        </div>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      </div>
    );
  }

  const activeCategory = categories.find(c => c.id === activeTabId) || categories[0];
  const displayItems = getProcessedItems(activeCategory.items);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 text-white sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-white/70 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            </Link>
            <div>
              <h1 className="font-bold text-sm">Talep - Randevu Asistanı</h1>
              <p className="text-[10px] text-orange-400">Pro V37</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(!showFilters)} className="p-2 hover:bg-slate-800 rounded-lg" title="Filtreler">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            </button>
            <button onClick={() => setShowAddCategoryModal(true)} className="p-2 hover:bg-slate-800 rounded-lg" title="Yeni Bölüm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </button>
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-slate-800 rounded-lg">
              {showMenu 
                ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
              }
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="overflow-x-auto pb-2 px-2">
          <div className="flex gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setActiveTabId(cat.id); setIsCalendarView(false); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-2 whitespace-nowrap ${activeTabId === cat.id ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-800 text-white/80 border-slate-700 hover:bg-slate-700'}`}
              >
                {cat.title} <span className="text-[10px] opacity-70">({cat.items.length})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Toggle */}
        {activeTabId === 'cat_randevu' && (
          <div className="px-4 pb-2">
            <button onClick={() => setIsCalendarView(!isCalendarView)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isCalendarView ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-indigo-200'}`}>
              {isCalendarView ? '📋 Liste Görünümü' : '📅 Takvim Görünümü'}
            </button>
          </div>
        )}

        {/* City Filter */}
        {!isCalendarView && (
          <div className="overflow-x-auto pb-2 px-2">
            <div className="flex gap-2">
              <button onClick={() => setActiveCityFilter('all')} className={`text-xs px-3 py-1.5 rounded-full border transition-all ${activeCityFilter === 'all' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-600 border-slate-300'}`}>Tümü</button>
              {cities.map(city => (
                <button key={city.id} onClick={() => setActiveCityFilter(city.id)} className={`text-xs px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${activeCityFilter === city.id ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-600 border-slate-300'}`}>{city.title}</button>
              ))}
            </div>
          </div>
        )}

        {/* Deal Type Filter */}
        {!isCalendarView && activeTabId !== 'cat_todo' && activeTabId !== 'cat_randevu' && (
          <div className="px-4 pb-2">
            <div className="flex gap-2">
              <button onClick={() => setActiveDealType('all')} className={`text-xs px-4 py-1 rounded-md border font-bold transition-all ${activeDealType === 'all' ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-500 border-slate-200'}`}>Tümü</button>
              <button onClick={() => setActiveDealType('sale')} className={`text-xs px-4 py-1 rounded-md border font-bold transition-all ${activeDealType === 'sale' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-600 border-slate-200'}`}>Satılık</button>
              <button onClick={() => setActiveDealType('rent')} className={`text-xs px-4 py-1 rounded-md border font-bold transition-all ${activeDealType === 'rent' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-purple-600 border-slate-200'}`}>Kiralık</button>
            </div>
          </div>
        )}

        {/* Advanced Filters */}
        {!isCalendarView && showFilters && (
          <div className="px-4 pb-3 space-y-2 bg-slate-800/50">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400">Sırala:</span>
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg p-2 outline-none">
                <option value="date_desc">En Yeni</option>
                <option value="date_asc">En Eski</option>
                <option value="price_asc">Fiyat (Artan)</option>
                <option value="price_desc">Fiyat (Azalan)</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Fiyat:</span>
              <input type="number" value={priceFilter.min} onChange={(e) => setPriceFilter({ ...priceFilter, min: e.target.value })} placeholder="Min" className="w-20 bg-white border border-slate-300 rounded-lg p-1.5 text-xs" />
              <input type="number" value={priceFilter.max} onChange={(e) => setPriceFilter({ ...priceFilter, max: e.target.value })} placeholder="Max" className="w-20 bg-white border border-slate-300 rounded-lg p-1.5 text-xs" />
            </div>
            <div className="flex gap-1 flex-wrap">
              {availableTags.map(tag => (
                <button key={tag} onClick={() => toggleFilter(tag)} className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap ${activeFilters.includes(tag) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300'}`}>{tag}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-40">
        <div className="p-4">
          {isCalendarView && activeTabId === 'cat_randevu' ? (
            /* Calendar View */
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1))} className="p-1 hover:bg-slate-100 rounded">◀</button>
                <span className="font-bold text-slate-700">{currentCalendarDate.toLocaleString('tr-TR', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1))} className="p-1 hover:bg-slate-100 rounded">▶</button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 mb-2">
                {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pa'].map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentCalendarDate).map((date, i) => {
                  if (!date) return <div key={i} className="p-2"></div>;
                  const dayEvents = categories.find(c => c.id === 'cat_randevu')!.items.filter((item: any) => {
                    if (!item.alarmTime) return false;
                    const itemDate = new Date(item.alarmTime);
                    return itemDate.getDate() === date.getDate() && itemDate.getMonth() === date.getMonth() && itemDate.getFullYear() === date.getFullYear();
                  });
                  return (
                    <div key={i} onClick={() => setViewingDayDate(date)} className={`p-2 text-center rounded-lg cursor-pointer text-sm border transition-all ${dayEvents.length > 0 ? 'bg-indigo-50 border-indigo-200 font-bold text-indigo-700' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}>
                      {date.getDate()}
                      {dayEvents.length > 0 && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mx-auto mt-1"></div>}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* List View */
            displayItems.length === 0 ? (
              <p className="text-center text-slate-400 py-8">Kayıt yok.</p>
            ) : (
              <div className="space-y-3">
                {displayItems.map((item: any) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 border border-slate-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">#{item.adNo || '---'}</span>
                        {item.cityName && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">{item.cityName}</span>}
                      </div>
                      {item.price > 0 && <span className="text-sm font-bold text-green-600">{formatCurrency(item.price)}</span>}
                    </div>
                    {(item.phone || item.contactName) && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                        📞 <span className="font-medium">{item.contactName || 'İsimsiz'}</span> | <a href={`tel:${item.phone}`} className="text-blue-600 underline">{item.phone}</a>
                      </div>
                    )}
                    <div className="flex gap-2 mb-2">
                      {item.dealType === 'rent' && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">KİRALIK</span>}
                      {item.dealType === 'sale' && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">SATILIK</span>}
                    </div>
                    <p className="text-sm text-slate-700 mb-2">{item.text}</p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.tags.map((tag: string) => <span key={tag} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{tag}</span>)}
                      </div>
                    )}
                    {item.alarmActive && item.alarmTime && (
                      <div className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded mb-2">
                        🔔 {new Date(item.alarmTime).toLocaleString('tr-TR')}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400">{item.date}</span>
                      <div className="flex gap-2">
                        {item.alarmTime && <button onClick={() => addToGoogleCalendar(item)} className="p-1.5 rounded-full text-blue-600 bg-blue-50 hover:bg-blue-100" title="Takvime Ekle">📅</button>}
                        <button onClick={() => setEditingItem({ originalCatId: activeCategory.id, targetCatId: activeCategory.id, item: { ...item } })} className="p-1.5 rounded-full text-slate-400 hover:bg-blue-50 hover:text-blue-500">✏️</button>
                        <button onClick={() => deleteItem(activeCategory.id, item.id)} className="p-1.5 rounded-full text-slate-400 hover:text-red-500">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Input Area */}
      {!isCalendarView && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg">
          {feedbackMsg && <div className="text-center text-green-600 text-sm font-bold mb-2">{feedbackMsg}</div>}
          <div className="flex gap-2">
            <button onClick={startListening} className={`p-3 rounded-xl ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-500 text-white hover:bg-orange-600'}`}>
              🎙️
            </button>
            <div className="flex-1 relative">
              <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); processCommand(inputText); } }} placeholder="Yazın veya konuşun..." className="w-full bg-slate-100 rounded-xl p-3 pr-10 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-14" />
              {inputText && <button onClick={() => processCommand(inputText)} className="absolute right-2 top-2 text-blue-600 bg-white p-1.5 rounded-lg shadow-sm">➤</button>}
            </div>
          </div>
        </div>
      )}

      {/* Menu */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowMenu(false)}>
          <div className="absolute right-4 top-16 bg-white rounded-xl shadow-xl p-4 w-72" onClick={e => e.stopPropagation()}>
            <p className="font-bold text-slate-800 mb-1">Emlak Asistanı</p>
            <p className="text-xs text-slate-500 mb-4">Admin Kullanıcı</p>
            
            <button onClick={testAlarm} className="w-full text-left px-3 py-2 text-sm text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-lg flex items-center gap-2 mb-1 border border-yellow-200">
              🔔 Bildirim ve Sesi Test Et
            </button>
            
            <button onClick={() => { setShowImportModal(true); setShowMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg flex items-center gap-2 font-bold mb-1 border border-purple-200">
              📤 Veri Yükle (.txt)
            </button>
            
            <button onClick={downloadAllData} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded-lg flex items-center gap-2">
              📥 Tüm Verileri İndir
            </button>
            
            <button onClick={downloadFilteredData} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded-lg flex items-center gap-2">
              📋 Şu Anki Listeyi İndir
            </button>
            
            <hr className="my-2" />
            
            <button onClick={() => { setShowCityManagerModal(true); setShowMenu(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded-lg flex items-center gap-2">
              🏙️ Şehirleri Düzenle
            </button>
            
            <button onClick={() => { setEditingCategoryData({ ...activeCategory }); setShowEditCategoryModal(true); setShowMenu(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded-lg flex items-center gap-2">
              📂 Bölümü Düzenle
            </button>
            
            <button onClick={() => { setShowTagManagerModal(true); setShowMenu(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded-lg flex items-center gap-2">
              🏷️ Etiketleri Düzenle
            </button>
            
            <hr className="my-2" />
            
            <Link href="/admin" className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-2">
              ← Admin Paneline Dön
            </Link>
          </div>
        </div>
      )}

      {/* View Day Modal */}
      {viewingDayDate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewingDayDate(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewingDayDate(null)} className="absolute top-3 right-3 text-slate-400 text-lg">✕</button>
            <h3 className="font-bold text-lg text-slate-800 mb-4">{viewingDayDate.toLocaleDateString('tr-TR')}</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {(() => {
                const dayEvents = categories.find(c => c.id === 'cat_randevu')!.items.filter((item: any) => {
                  if (!item.alarmTime) return false;
                  const itemDate = new Date(item.alarmTime);
                  return itemDate.getDate() === viewingDayDate.getDate() && itemDate.getMonth() === viewingDayDate.getMonth() && itemDate.getFullYear() === viewingDayDate.getFullYear();
                });
                if (dayEvents.length === 0) return <p className="text-slate-400 text-center">Bu güne ait randevu yok.</p>;
                return dayEvents.map((event: any) => (
                  <div key={event.id} className="bg-indigo-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-indigo-600">{new Date(event.alarmTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                      <div className="flex gap-1">
                        <button onClick={() => addToGoogleCalendar(event)} className="p-1 bg-white rounded text-indigo-600">📅</button>
                        <button onClick={() => { setEditingItem({ originalCatId: 'cat_randevu', targetCatId: 'cat_randevu', item: { ...event } }); setViewingDayDate(null); }} className="p-1 bg-white rounded text-slate-400">✏️</button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700">{event.text}</p>
                    {event.contactName && <p className="text-xs text-slate-500 mt-1">{event.contactName}</p>}
                  </div>
                ));
              })()}
            </div>
            <button onClick={() => { setCalendarSelectedDate(viewingDayDate); setViewingDayDate(null); }} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 mt-4">
              ➕ Yeni Ekle
            </button>
          </div>
        </div>
      )}

      {/* Add Event to Date Modal */}
      {calendarSelectedDate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setCalendarSelectedDate(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setCalendarSelectedDate(null)} className="absolute top-3 right-3 text-slate-400 text-lg">✕</button>
            <h3 className="font-bold text-lg text-slate-800">{calendarSelectedDate.toLocaleDateString('tr-TR')}</h3>
            <p className="text-xs text-slate-500 mb-4">Bu tarihe randevu ekleyin</p>
            <textarea value={calendarInputText} onChange={(e) => setCalendarInputText(e.target.value)} placeholder="Randevu notu..." className="w-full bg-slate-100 rounded-lg p-3 text-sm h-20 mb-3" />
            <button onClick={() => { if (!calendarInputText) return; processCommand(calendarInputText, calendarSelectedDate); setCalendarSelectedDate(null); setCalendarInputText(''); }} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl text-sm">EKLE</button>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditingItem(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Kaydı Düzenle</h3>
                <span className="text-xs font-mono text-slate-500">#{editingItem.item.adNo || '---'}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Bölüm:</label>
                <select value={editingItem.targetCatId} onChange={(e) => setEditingItem({ ...editingItem, targetCatId: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Şehir:</label>
                <select value={editingItem.item.cityId || ''} onChange={(e) => { const selectedCity = cities.find(c => c.id === e.target.value); setEditingItem({ ...editingItem, item: { ...editingItem.item, cityId: e.target.value, cityName: selectedCity ? selectedCity.title : '' } }); }} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm">
                  <option value="">Seçilmedi</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <input type="number" value={editingItem.item.price || ''} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, price: parseFloat(e.target.value) || 0 } })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm" placeholder="Fiyat" />
              <select value={editingItem.item.dealType || 'sale'} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, dealType: e.target.value } })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm">
                <option value="sale">Satılık</option>
                <option value="rent">Kiralık</option>
              </select>
              <input value={editingItem.item.contactName || ''} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, contactName: e.target.value } })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm" placeholder="İsim" />
              <input value={editingItem.item.phone || ''} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, phone: e.target.value } })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm" placeholder="Telefon" />
              <textarea value={editingItem.item.text || ''} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, text: e.target.value } })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm h-20" />
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-yellow-700">Alarm Kur</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={editingItem.item.alarmActive || false} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, alarmActive: e.target.checked } })} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>
                <input type="datetime-local" value={editingItem.item.alarmTime || ''} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, alarmTime: e.target.value, alarmActive: true } })} className="w-full bg-white border border-yellow-300 rounded p-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditingItem(null)} className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-xl text-sm font-bold">İptal</button>
              <button onClick={saveItemChanges} className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-bold">Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddCategoryModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-slate-800 mb-4">Yeni Bölüm Ekle</h3>
            <input value={newCatTitle} onChange={(e) => setNewCatTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 mb-3 text-sm" placeholder="Bölüm Adı" />
            <textarea value={newCatKeywords} onChange={(e) => setNewCatKeywords(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 mb-4 text-sm h-20" placeholder="Anahtar Kelimeler (virgülle ayırın)" />
            <button onClick={addNewCategory} className="w-full bg-slate-800 text-white py-2 rounded-lg text-sm font-bold">OLUŞTUR</button>
            <button onClick={() => setShowAddCategoryModal(false)} className="w-full mt-2 text-slate-400 text-xs py-2">İptal</button>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditCategoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowEditCategoryModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-slate-800 mb-4">Bölümü Düzenle</h3>
            <input value={editingCategoryData.title} onChange={(e) => setEditingCategoryData({ ...editingCategoryData, title: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 mb-3 text-sm" placeholder="Bölüm Adı" />
            <textarea value={editingCategoryData.keywords} onChange={(e) => setEditingCategoryData({ ...editingCategoryData, keywords: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 mb-4 text-sm h-20" placeholder="Anahtar Kelimeler" />
            <div className="flex gap-2">
              <button onClick={deleteCategory} className="flex-1 bg-red-50 text-red-500 py-2 rounded-lg text-sm font-bold">SİL</button>
              <button onClick={saveCategory} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-bold">KAYDET</button>
            </div>
            <button onClick={() => setShowEditCategoryModal(false)} className="w-full mt-2 text-slate-400 text-xs py-2">İptal</button>
          </div>
        </div>
      )}

      {/* Tag Manager Modal */}
      {showTagManagerModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowTagManagerModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-slate-800 mb-4">Etiketleri Düzenle</h3>
            <div className="flex gap-2 mb-4">
              <input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="Yeni etiket" className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm" />
              <button onClick={addNewTag} className="bg-blue-600 text-white px-3 rounded-lg">➕</button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
              {availableTags.map(tag => (
                <div key={tag} className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-full text-sm">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="text-red-400 hover:text-red-600">✕</button>
                </div>
              ))}
            </div>
            <button onClick={() => setShowTagManagerModal(false)} className="mt-4 w-full bg-slate-800 text-white py-2 rounded-lg text-sm">Tamam</button>
          </div>
        </div>
      )}

      {/* City Manager Modal */}
      {showCityManagerModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCityManagerModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-slate-800 mb-4">Şehir Yönetimi</h3>
            <div className="space-y-2 mb-4">
              <input value={newCityTitle} onChange={(e) => setNewCityTitle(e.target.value)} placeholder="Şehir Adı" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm" />
              <textarea value={newCityKeywords} onChange={(e) => setNewCityKeywords(e.target.value)} placeholder="Mahalleler / Anahtar Kelimeler (Virgülle)" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm h-16" />
              <button onClick={addNewCity} className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-bold">EKLE</button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {cities.map(city => (
                <div key={city.id} className="bg-slate-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-700">{city.title}</span>
                    <button onClick={() => removeCity(city.id)} className="text-red-400 hover:text-red-600">🗑️</button>
                  </div>
                  <p className="text-xs text-slate-500">{city.keywords}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setShowCityManagerModal(false)} className="mt-4 w-full bg-slate-200 text-slate-700 py-2 rounded-lg text-sm">Kapat</button>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowImportModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-800">Dosya Yükle</h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400">✕</button>
            </div>
            <p className="text-xs text-slate-500 mb-4">Metin (.txt) dosyanızı seçin.</p>
            <div className="mb-4">
              <label className="text-xs text-slate-500 block mb-1">Hedef Bölüm</label>
              <select value={importTarget} onChange={(e) => setImportTarget(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm">
                <option value="auto">✨ Otomatik (Genel)</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <label className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-xl cursor-pointer text-sm font-bold hover:bg-purple-700 w-full">
              📁 Dosya Seç
              <input type="file" accept=".txt" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
