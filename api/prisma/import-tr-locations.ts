import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { importTurkeyLocations } from '../src/locations/import-tr-locations';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required for importing locations.');
}

const ssl =
  databaseUrl.includes('sslmode=require') ||
  databaseUrl.includes('sslmode=verify-ca') ||
  databaseUrl.includes('sslmode=verify-full')
    ? { rejectUnauthorized: false }
    : undefined;
const pool = new Pool({ connectionString: databaseUrl, ssl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const stats = await importTurkeyLocations(prisma);
  // eslint-disable-next-line no-console
  console.log(
    `Locations imported: ${stats.cities} cities, ${stats.districts} districts, ${stats.neighborhoods} neighborhoods`,
  );
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Import failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
