import "dotenv/config";
import bcrypt from "bcryptjs";
import {
  ListingAttributeType,
  ListingCategory,
  ListingStatus,
  Prisma,
  PrismaClient,
  Role,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

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
  await prisma.consultantRequest.deleteMany();
  await prisma.customerRequest.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.consultant.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.neighborhood.deleteMany();
  await prisma.district.deleteMany();
  await prisma.city.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await clearData();

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

  const konya = await prisma.city.create({
    data: { name: "Konya", slug: "konya" },
  });
  const karaman = await prisma.city.create({
    data: { name: "Karaman", slug: "karaman" },
  });

  const selcuklu = await prisma.district.create({
    data: { name: "Selçuklu", slug: "selcuklu", cityId: konya.id },
  });
  const larende = await prisma.district.create({
    data: { name: "Larende", slug: "larende", cityId: karaman.id },
  });

  const bosna = await prisma.neighborhood.create({
    data: {
      name: "Bosna Hersek",
      slug: "bosna-hersek",
      cityId: konya.id,
      districtId: selcuklu.id,
    },
  });
  const merkez = await prisma.neighborhood.create({
    data: {
      name: "Merkez",
      slug: "merkez",
      cityId: karaman.id,
      districtId: larende.id,
    },
  });

  const konyaBranch = await prisma.branch.create({
    data: {
      name: "Konya Merkez",
      slug: "konya-merkez",
      cityId: konya.id,
      address: "Selçuklu, Konya",
    },
  });

  const karamanBranch = await prisma.branch.create({
    data: {
      name: "Karaman Merkez",
      slug: "karaman-merkez",
      cityId: karaman.id,
      address: "Karaman Merkez",
    },
  });

  const consultant = await prisma.consultant.create({
    data: {
      userId: consultantUser.id,
      branchId: konyaBranch.id,
      title: "Emlak Danışmanı",
      whatsappNumber: "+905433061499",
      contactPhone: "+905433061499",
      bio: "Konya bölgesinde konut ve ticari danışmanlığı.",
    },
  });

  await prisma.siteSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteName: "Emlaknomi",
      ownerName: "Özcan Aktaş",
      ownerTitle: "Danışman",
      phoneNumber: "0543 306 14 99",
      whatsappNumber: "0543 306 14 99",
      email: "emlaknomiozcan@gmail.com",
      supportEmail: "destek@ozcanaktas.com",
      primaryColor: "#1a436e",
      accentColor: "#e20b0b",
      backgroundColor: "#e9e9f0",
      textColor: "#122033",
    },
  });

  await prisma.listingAttributeDefinition.createMany({
    data: [
      {
        category: ListingCategory.HOUSING,
        key: "rooms",
        label: "Oda Sayısı",
        type: ListingAttributeType.SELECT,
        options: ["1+0", "1+1", "2+1", "3+1", "4+1", "5+1", "6+1"],
        sortOrder: 1,
      },
      {
        category: ListingCategory.HOUSING,
        key: "bathrooms",
        label: "Banyo",
        type: ListingAttributeType.NUMBER,
        sortOrder: 2,
      },
      {
        category: ListingCategory.HOUSING,
        key: "floor",
        label: "Bulunduğu Kat",
        type: ListingAttributeType.TEXT,
        sortOrder: 3,
      },
      {
        category: ListingCategory.HOUSING,
        key: "buildingAge",
        label: "Bina Yaşı",
        type: ListingAttributeType.NUMBER,
        sortOrder: 4,
      },
      {
        category: ListingCategory.HOUSING,
        key: "heating",
        label: "Isıtma",
        type: ListingAttributeType.SELECT,
        options: ["Doğalgaz", "Merkezi", "Soba", "Klima"],
        sortOrder: 5,
      },
      {
        category: ListingCategory.HOUSING,
        key: "furnished",
        label: "Eşyalı",
        type: ListingAttributeType.BOOLEAN,
        sortOrder: 6,
      },
      {
        category: ListingCategory.HOUSING,
        key: "balcony",
        label: "Balkon",
        type: ListingAttributeType.BOOLEAN,
        sortOrder: 7,
      },
      {
        category: ListingCategory.HOUSING,
        key: "elevator",
        label: "Asansör",
        type: ListingAttributeType.BOOLEAN,
        sortOrder: 8,
      },
      {
        category: ListingCategory.HOUSING,
        key: "parking",
        label: "Otopark",
        type: ListingAttributeType.BOOLEAN,
        sortOrder: 9,
      },
      {
        category: ListingCategory.LAND,
        key: "zoningStatus",
        label: "İmar Durumu",
        type: ListingAttributeType.SELECT,
        options: ["İmarlı", "İmarsız", "Ticari", "Konut"],
        sortOrder: 1,
      },
      {
        category: ListingCategory.LAND,
        key: "block",
        label: "Ada",
        type: ListingAttributeType.TEXT,
        sortOrder: 2,
      },
      {
        category: ListingCategory.LAND,
        key: "parcel",
        label: "Parsel",
        type: ListingAttributeType.TEXT,
        sortOrder: 3,
      },
      {
        category: ListingCategory.LAND,
        key: "gabari",
        label: "Gabari",
        type: ListingAttributeType.TEXT,
        sortOrder: 4,
      },
      {
        category: ListingCategory.COMMERCIAL,
        key: "usageType",
        label: "Kullanım Tipi",
        type: ListingAttributeType.SELECT,
        options: ["Dükkan", "Ofis", "Depo", "İşyeri"],
        sortOrder: 1,
      },
      {
        category: ListingCategory.COMMERCIAL,
        key: "floor",
        label: "Kat",
        type: ListingAttributeType.TEXT,
        sortOrder: 2,
      },
      {
        category: ListingCategory.COMMERCIAL,
        key: "ceilingHeight",
        label: "Tavan Yüksekliği",
        type: ListingAttributeType.TEXT,
        sortOrder: 3,
      },
      {
        category: ListingCategory.TRANSFER,
        key: "businessType",
        label: "İşletme Türü",
        type: ListingAttributeType.TEXT,
        sortOrder: 1,
      },
      {
        category: ListingCategory.TRANSFER,
        key: "employeeCount",
        label: "Personel Sayısı",
        type: ListingAttributeType.NUMBER,
        sortOrder: 2,
      },
      {
        category: ListingCategory.FIELD,
        key: "soilType",
        label: "Toprak Tipi",
        type: ListingAttributeType.TEXT,
        sortOrder: 1,
      },
      {
        category: ListingCategory.FIELD,
        key: "irrigation",
        label: "Sulama",
        type: ListingAttributeType.SELECT,
        options: ["Var", "Yok"],
        sortOrder: 2,
      },
      {
        category: ListingCategory.GARDEN,
        key: "water",
        label: "Su",
        type: ListingAttributeType.SELECT,
        options: ["Var", "Yok"],
        sortOrder: 1,
      },
      {
        category: ListingCategory.GARDEN,
        key: "electricity",
        label: "Elektrik",
        type: ListingAttributeType.SELECT,
        options: ["Var", "Yok"],
        sortOrder: 2,
      },
      {
        category: ListingCategory.HOBBY_GARDEN,
        key: "fence",
        label: "Çevrili",
        type: ListingAttributeType.SELECT,
        options: ["Var", "Yok"],
        sortOrder: 1,
      },
    ],
    skipDuplicates: true,
  });

  const listingOne = await prisma.listing.create({
    data: {
      title: "Site İçinde 3+1 Daire",
      description:
        "Geniş kullanım alanı, kapalı otopark ve çocuk oyun alanı bulunan site içinde.",
      status: ListingStatus.FOR_SALE,
      category: ListingCategory.HOUSING,
      propertyType: "Daire",
      price: new Prisma.Decimal("3250000"),
      currency: "TRY",
      areaGross: new Prisma.Decimal("145"),
      areaNet: new Prisma.Decimal("130"),
      isOpportunity: true,
      branchId: konyaBranch.id,
      cityId: konya.id,
      districtId: selcuklu.id,
      neighborhoodId: bosna.id,
      consultantId: consultant.id,
      createdByUserId: adminUser.id,
      attributes: {
        rooms: "3+1",
        bathrooms: 2,
        floor: "5",
        heating: "Doğalgaz",
      },
      publishedAt: new Date(),
    },
  });

  const listingTwo = await prisma.listing.create({
    data: {
      title: "Merkezde Satılık Dükkan",
      description: "Karaman merkezde cadde üzeri, yüksek yaya trafiği.",
      status: ListingStatus.FOR_SALE,
      category: ListingCategory.COMMERCIAL,
      propertyType: "Dükkan",
      price: new Prisma.Decimal("4750000"),
      currency: "TRY",
      areaGross: new Prisma.Decimal("90"),
      areaNet: new Prisma.Decimal("80"),
      isOpportunity: false,
      branchId: karamanBranch.id,
      cityId: karaman.id,
      districtId: larende.id,
      neighborhoodId: merkez.id,
      createdByUserId: adminUser.id,
      attributes: {
        frontage: "Cadde üzeri",
        ceilingHeight: "3.5 m",
      },
      publishedAt: new Date(),
    },
  });

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
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
