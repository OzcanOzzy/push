import https from 'https';

const DATA_URL =
  'https://raw.githubusercontent.com/hsndmr/turkiye-city-county-district-neighborhood/master/data.json';

type LocationNeighborhood = {
  name: string;
  code?: string;
};

type LocationDistrict = {
  name: string;
  neighborhoods: LocationNeighborhood[];
};

type LocationCounty = {
  name: string;
  districts: LocationDistrict[];
};

type LocationCity = {
  name: string;
  counties: LocationCounty[];
};

type ImportStats = {
  cities: number;
  districts: number;
  neighborhoods: number;
};

type PrismaClientLike = {
  city: { upsert: (args: unknown) => Promise<{ id: string }> };
  district: { upsert: (args: unknown) => Promise<{ id: string }> };
  neighborhood: { createMany: (args: unknown) => Promise<unknown> };
};

const slugify = (value: string) => {
  const normalized = value
    .toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u');

  return normalized
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
};

const normalizeName = (value: string) => {
  const cleaned = value.replace(/\s+/g, ' ').trim();
  return cleaned
    .toLocaleLowerCase('tr-TR')
    .replace(/\b\p{L}/gu, (char) => char.toLocaleUpperCase('tr-TR'));
};

const fetchJson = <T>(url: string): Promise<T> =>
  new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (
        response.statusCode &&
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        response.resume();
        fetchJson<T>(response.headers.location).then(resolve).catch(reject);
        return;
      }

      if (!response.statusCode || response.statusCode >= 400) {
        response.resume();
        reject(new Error(`Failed to fetch locations (${response.statusCode})`));
        return;
      }

      const chunks: Buffer[] = [];
      response.on('data', (chunk) =>
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)),
      );
      response.on('end', () => {
        try {
          const payload = Buffer.concat(chunks).toString('utf8');
          resolve(JSON.parse(payload) as T);
        } catch (error) {
          reject(error);
        }
      });
    });

    request.on('error', reject);
  });

const chunk = <T>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

export async function importTurkeyLocations(
  prisma: PrismaClientLike,
): Promise<ImportStats> {
  const data = await fetchJson<LocationCity[]>(DATA_URL);
  const stats: ImportStats = { cities: 0, districts: 0, neighborhoods: 0 };

  for (const city of data) {
    const cityName = normalizeName(city.name);
    const citySlug = slugify(cityName);
    const cityRecord = await prisma.city.upsert({
      where: { slug: citySlug },
      update: { name: cityName },
      create: { name: cityName, slug: citySlug },
    });
    stats.cities += 1;

    const counties = city.counties ?? [];
    for (const county of counties) {
      const districtName = normalizeName(county.name);
      const districtSlug = slugify(districtName);
      const districtRecord = await prisma.district.upsert({
        where: {
          cityId_slug: { cityId: cityRecord.id, slug: districtSlug },
        },
        update: { name: districtName },
        create: {
          name: districtName,
          slug: districtSlug,
          cityId: cityRecord.id,
        },
      });
      stats.districts += 1;

      const neighborhoodRecords: {
        name: string;
        slug: string;
        cityId: string;
        districtId: string;
      }[] = [];

      const neighborhoodsSeen = new Set<string>();
      const districts = county.districts ?? [];
      for (const district of districts) {
        const neighborhoodNames: string[] = [district.name];
        const nested = district.neighborhoods ?? [];
        for (const nestedItem of nested) {
          neighborhoodNames.push(nestedItem.name);
        }

        for (const name of neighborhoodNames) {
          const normalized = normalizeName(name);
          const slug = slugify(normalized);
          if (neighborhoodsSeen.has(slug)) {
            continue;
          }
          neighborhoodsSeen.add(slug);
          neighborhoodRecords.push({
            name: normalized,
            slug,
            cityId: cityRecord.id,
            districtId: districtRecord.id,
          });
        }
      }

      for (const group of chunk(neighborhoodRecords, 500)) {
        if (group.length === 0) {
          continue;
        }
        await prisma.neighborhood.createMany({
          data: group,
          skipDuplicates: true,
        });
        stats.neighborhoods += group.length;
      }
    }
  }

  return stats;
}
