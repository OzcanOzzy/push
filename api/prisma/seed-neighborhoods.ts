// Türkiye Mahalle Verileri - GitHub'dan dinamik olarak çeker
// ~73,305 mahalle

const GITHUB_DATA_URL = "https://raw.githubusercontent.com/hsndmr/turkiye-city-county-district-neighborhood/main/data.json";

// Slug oluştur (Türkçe karakterleri önce değiştir, sonra lowercase)
function createSlug(name: string): string {
  return name
    .replace(/Ğ/g, "g")
    .replace(/Ü/g, "u")
    .replace(/Ş/g, "s")
    .replace(/İ/g, "i")
    .replace(/Ö/g, "o")
    .replace(/Ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Mahalle adını temizle (MAH, KÖYÜ vb. kaldır)
function cleanNeighborhoodName(name: string): string {
  return name
    .replace(/ MAH\.?$/i, "")
    .replace(/ MAHALLESİ$/i, "")
    .replace(/ KÖYÜ$/i, "")
    .replace(/ BELDESİ$/i, "")
    .trim();
}

interface GithubNeighborhood {
  name: string;
  code: string;
}

interface GithubDistrict {
  name: string;
  neighborhoods: GithubNeighborhood[];
}

interface GithubCounty {
  name: string;
  districts: GithubDistrict[];
}

interface GithubProvince {
  name: string;
  counties: GithubCounty[];
}

// Ana seed fonksiyonu
export async function seedNeighborhoods(prisma: {
  city: { findMany: () => Promise<{ id: string; name: string }[]> };
  district: { findMany: (args: { where: { cityId: string } }) => Promise<{ id: string; name: string; cityId: string }[]> };
  neighborhood: { 
    create: (args: { data: { name: string; slug: string; cityId: string; districtId: string } }) => Promise<{ id: string }>;
    count: () => Promise<number>;
  };
}) {
  console.log("Fetching neighborhood data from GitHub...");
  
  // GitHub'dan veri çek
  const response = await fetch(GITHUB_DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status}`);
  }
  
  const data: GithubProvince[] = await response.json();
  console.log(`Fetched ${data.length} provinces from GitHub`);
  
  // Veritabanındaki şehirleri al
  const cities = await prisma.city.findMany();
  const cityMap = new Map<string, string>(); // name -> id
  for (const city of cities) {
    cityMap.set(city.name.toUpperCase(), city.id);
    // Alternatif isimler için
    cityMap.set(createSlug(city.name), city.id);
  }
  
  let totalNeighborhoods = 0;
  let skippedCities = 0;
  let skippedDistricts = 0;
  
  // Her il için
  for (const province of data) {
    const cityId = cityMap.get(province.name.toUpperCase()) || cityMap.get(createSlug(province.name));
    
    if (!cityId) {
      console.log(`  ! City not found: ${province.name}`);
      skippedCities++;
      continue;
    }
    
    // İlçeleri al
    const districts = await prisma.district.findMany({ where: { cityId } });
    const districtMap = new Map<string, string>(); // name -> id
    for (const district of districts) {
      districtMap.set(district.name.toUpperCase(), district.id);
      districtMap.set(createSlug(district.name), district.id);
      // "MERKEZ" için alternatifler
      if (district.name.toUpperCase() === "MERKEZ") {
        districtMap.set("MERKEZ", district.id);
        districtMap.set("MERKEZKÖYLER", district.id);
      }
    }
    
    // Her ilçe grubu (county) için
    for (const county of province.counties) {
      const districtId = districtMap.get(county.name.toUpperCase()) || districtMap.get(createSlug(county.name));
      
      if (!districtId) {
        // MERKEZ ilçeyi dene
        const merkez = districtMap.get("MERKEZ");
        if (!merkez) {
          skippedDistricts++;
          continue;
        }
      }
      
      const actualDistrictId = districtId || districtMap.get("MERKEZ");
      if (!actualDistrictId) continue;
      
      // Her alt bölge (district) için
      for (const subDistrict of county.districts) {
        // Her mahalle için
        for (const neighborhood of subDistrict.neighborhoods) {
          const cleanName = cleanNeighborhoodName(neighborhood.name);
          
          try {
            await prisma.neighborhood.create({
              data: {
                name: cleanName,
                slug: createSlug(cleanName),
                cityId,
                districtId: actualDistrictId,
              },
            });
            totalNeighborhoods++;
            
            // Her 1000 mahallede bir log
            if (totalNeighborhoods % 1000 === 0) {
              console.log(`  + ${totalNeighborhoods} neighborhoods created...`);
            }
          } catch (error) {
            // Muhtemelen duplicate - atla
          }
        }
      }
    }
    
    console.log(`  ✓ ${province.name}`);
  }
  
  const finalCount = await prisma.neighborhood.count();
  console.log(`\nNeighborhood seeding complete:`);
  console.log(`  - Total neighborhoods: ${finalCount}`);
  console.log(`  - Skipped cities: ${skippedCities}`);
  console.log(`  - Skipped districts: ${skippedDistricts}`);
  
  return { neighborhoodCount: finalCount };
}
