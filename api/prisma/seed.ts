import "dotenv/config";
import bcrypt from "bcryptjs";
import {
  ListingCategory,
  ListingStatus,
  Prisma,
  PrismaClient,
  Role,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { seedListingAttributes } from "./seed-listing-attributes";
import { seedTurkeyLocations, TURKEY_PROVINCES } from "./seed-turkey-locations";
import { seedNeighborhoods } from "./seed-neighborhoods";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for seeding.");
}

const ssl =
  databaseUrl.includes("sslmode=require") ||
  databaseUrl.includes("sslmode=verify-ca") ||
  databaseUrl.includes("sslmode=verify-full")
    ? { rejectUnauthorized: false }
    : undefined;
const pool = new Pool({ connectionString: databaseUrl, ssl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function clearData() {
  console.log("Clearing existing data...");
  await prisma.consultantRequest.deleteMany();
  await prisma.customerRequest.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.listingAttributeDefinition.deleteMany();
  await prisma.consultant.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.cityButton.deleteMany();
  await prisma.actionButton.deleteMany();
  await prisma.neighborhood.deleteMany();
  await prisma.district.deleteMany();
  await prisma.city.deleteMany();
  await prisma.user.deleteMany();
  // await prisma.siteSetting.deleteMany(); // Bu satırı kaldırdım
  console.log("Data cleared.");
}

async function main() {
  await clearData();

  // ========== USERS ==========
  console.log("Creating users...");
  const [adminPassword, consultantPassword] = await Promise.all([
    bcrypt.hash("ChangeMe123!", 10),
    bcrypt.hash("Consultant123!", 10),
  ]);

  const adminUser = await prisma.user.create({
    data: {
      name: "Özcan Aktaş",
      email: "admin@ozcanaktas.com",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  const consultantUser = await prisma.user.create({
    data: {
      name: "Ayşe Demir",
      email: "danisman@ozcanaktas.com",
      passwordHash: consultantPassword,
      role: Role.CONSULTANT,
    },
  });

  // ========== TURKEY LOCATIONS (81 Province + All Districts) ==========
  console.log("Seeding Turkey locations...");
  await seedTurkeyLocations(prisma);

  // Önemli şehirleri al (branch ve listing için)
  const konya = await prisma.city.findFirst({ where: { slug: "konya" } });
  const karaman = await prisma.city.findFirst({ where: { slug: "karaman" } });
  const ankara = await prisma.city.findFirst({ where: { slug: "ankara" } });
  const istanbul = await prisma.city.findFirst({ where: { slug: "istanbul" } });

  if (!konya || !karaman || !ankara || !istanbul) {
    throw new Error("Core cities not found after seeding!");
  }

  // Önemli ilçeleri al
  const selcuklu = await prisma.district.findFirst({ where: { name: "Selçuklu", cityId: konya.id } });
  const meram = await prisma.district.findFirst({ where: { name: "Meram", cityId: konya.id } });
  const karatay = await prisma.district.findFirst({ where: { name: "Karatay", cityId: konya.id } });
  const karamanMerkez = await prisma.district.findFirst({ where: { name: "Merkez", cityId: karaman.id } });
  const cankaya = await prisma.district.findFirst({ where: { name: "Çankaya", cityId: ankara.id } });
  const kadikoy = await prisma.district.findFirst({ where: { name: "Kadıköy", cityId: istanbul.id } });

  if (!selcuklu || !karamanMerkez) {
    throw new Error("Core districts not found after seeding!");
  }

  // ========== NEIGHBORHOODS (Tüm Türkiye - GitHub'dan) ==========
  console.log("Seeding neighborhoods from GitHub (this may take a few minutes)...");
  try {
    await seedNeighborhoods(prisma);
  } catch (error) {
    console.log("Warning: Could not seed neighborhoods from GitHub:", error);
    console.log("Continuing with minimal sample neighborhoods...");
    
    // Fallback: minimal mahalleler
    const sampleNeighborhoods = [
      { name: "Bosna Hersek", cityId: konya.id, districtId: selcuklu.id },
      { name: "Yazır", cityId: konya.id, districtId: selcuklu.id },
      { name: "Alacasuluk", cityId: karaman.id, districtId: karamanMerkez.id },
    ];
    for (const n of sampleNeighborhoods) {
      await prisma.neighborhood.create({
        data: { name: n.name, slug: n.name.toLowerCase().replace(/\s+/g, "-"), cityId: n.cityId, districtId: n.districtId },
      });
    }
  }
  console.log("Neighborhoods seeding complete.");

  // ========== BRANCHES ==========
  console.log("Creating branches...");
  const konyaBranch = await prisma.branch.create({
    data: {
      name: "Konya Merkez",
      slug: "konya-merkez",
      cityId: konya.id,
      address: "Selçuklu, Konya",
      phone: "0332 123 45 67",
      whatsappNumber: "0543 306 14 99",
    },
  });

  const karamanBranch = await prisma.branch.create({
    data: {
      name: "Karaman Merkez",
      slug: "karaman-merkez",
      cityId: karaman.id,
      address: "Karaman Merkez",
      phone: "0338 123 45 67",
      whatsappNumber: "0543 306 14 99",
    },
  });

  // ========== CONSULTANTS ==========
  console.log("Creating consultants...");
  await prisma.consultant.create({
    data: {
      userId: consultantUser.id,
      branchId: konyaBranch.id,
      title: "Emlak Danışmanı",
      whatsappNumber: "+905433061499",
      contactPhone: "+905433061499",
      bio: "Konya bölgesinde konut ve ticari danışmanlığı.",
    },
  });


  // ========== CITY BUTTONS (Şube Butonları) ==========
  console.log("Creating city buttons...");
  await prisma.cityButton.create({
    data: {
      name: "Konya",
      slug: "konya",
      cityId: konya.id,
      address: "Selçuklu, Konya",
      phone: "0332 123 45 67",
      whatsappNumber: "0543 306 14 99",
      icon: "fa-solid fa-location-dot",
      sortOrder: 0,
      isActive: true,
    },
  });
  await prisma.cityButton.create({
    data: {
      name: "Karaman",
      slug: "karaman",
      cityId: karaman.id,
      address: "Karaman Merkez",
      phone: "0338 123 45 67",
      whatsappNumber: "0543 306 14 99",
      icon: "fa-solid fa-location-dot",
      sortOrder: 1,
      isActive: true,
    },
  });
  await prisma.cityButton.create({
    data: {
      name: "Ankara",
      slug: "ankara",
      cityId: ankara.id,
      icon: "fa-solid fa-location-dot",
      sortOrder: 2,
      isActive: true,
    },
  });
  await prisma.cityButton.create({
    data: {
      name: "İstanbul",
      slug: "istanbul",
      cityId: istanbul.id,
      icon: "fa-solid fa-location-dot",
      sortOrder: 3,
      isActive: true,
    },
  });

  // ========== ACTION BUTTONS (Aksiyon Butonları) ==========
  console.log("Creating action buttons...");
  await prisma.actionButton.create({
    data: {
      name: "SATMAK İSTİYORUM",
      linkUrl: "/satilik-kiralik-talep?type=SELL",
      bgColor: "#f97316",
      textColor: "#ffffff",
      icon: "fa-solid fa-house",
      sortOrder: 0,
      isActive: true,
    },
  });
  await prisma.actionButton.create({
    data: {
      name: "EVİM NE KADAR EDER?",
      linkUrl: "/evim-ne-kadar-eder",
      bgColor: "#0a4ea3",
      textColor: "#ffffff",
      icon: "fa-solid fa-calculator",
      sortOrder: 1,
      isActive: true,
    },
  });
  await prisma.actionButton.create({
    data: {
      name: "DEĞER ARTIŞ VERGİSİ",
      linkUrl: "https://ivd.gib.gov.tr/",
      bgColor: "#2f9e44",
      textColor: "#ffffff",
      icon: "fa-solid fa-receipt",
      sortOrder: 2,
      isActive: true,
    },
  });

  // ========== LISTING ATTRIBUTES ==========
  console.log("Seeding listing attributes...");
  const attrResult = await seedListingAttributes(prisma);
  console.log(`Listing attributes seeded: ${attrResult.attributeCount} attributes`);

  // ========== SAMPLE LISTINGS ==========
  console.log("Creating sample listings...");
  const listingOne = await prisma.listing.create({
    data: {
      listingNo: "00001",
      title: "Site İçinde 3+1 Daire",
      description:
        "Geniş kullanım alanı, kapalı otopark ve çocuk oyun alanı bulunan site içinde. 145 m² brüt alan, 3+1 oda düzeni.",
      status: ListingStatus.FOR_SALE,
      category: ListingCategory.HOUSING,
      subPropertyType: "DAIRE",
      price: new Prisma.Decimal("3250000"),
      currency: "TRY",
      areaGross: new Prisma.Decimal("145"),
      areaNet: new Prisma.Decimal("130"),
      isOpportunity: true,
      branchId: konyaBranch.id,
      cityId: konya.id,
      districtId: selcuklu.id,
      createdByUserId: adminUser.id,
      attributes: {
        roomCount: "3+1",
        buildingAge: "5",
        floorLocation: "3",
        totalFloors: "8",
        heatingType: ["Bireysel Kombi"],
      },
    },
  });

  const listingTwo = await prisma.listing.create({
    data: {
      listingNo: "00002",
      title: "Merkezde Satılık Dükkan",
      description: "Karaman merkezde cadde üzeri, yüksek yaya trafiği olan bölgede satılık dükkan.",
      status: ListingStatus.FOR_SALE,
      category: ListingCategory.COMMERCIAL,
      subPropertyType: "DUKKAN",
      price: new Prisma.Decimal("4750000"),
      currency: "TRY",
      areaGross: new Prisma.Decimal("90"),
      areaNet: new Prisma.Decimal("80"),
      isOpportunity: false,
      branchId: karamanBranch.id,
      cityId: karaman.id,
      districtId: karamanMerkez.id,
      createdByUserId: adminUser.id,
      attributes: {
        commercialArea: "90",
        buildingAge: "Sıfır",
      },
    },
  });

  // ========== LISTING IMAGES ==========
  console.log("Adding sample listing images...");
  await prisma.listingImage.createMany({
    data: [
      {
        listingId: listingOne.id,
        url: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6",
        isCover: true,
        sortOrder: 0,
      },
      {
        listingId: listingOne.id,
        url: "https://images.unsplash.com/photo-1501183638710-841dd1904471",
        isCover: false,
        sortOrder: 1,
      },
      {
        listingId: listingTwo.id,
        url: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef",
        isCover: true,
        sortOrder: 0,
      },
    ],
  });

  // ========== LISTING COUNTER ==========
  console.log("Setting up listing counter...");
  await prisma.listingCounter.upsert({
    where: { id: "default" },
    update: { lastNumber: 2 },
    create: { id: "default", lastNumber: 2 },
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
