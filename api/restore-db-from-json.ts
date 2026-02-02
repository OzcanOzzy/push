import { resolve } from "path";
require("dotenv").config({ path: resolve(__dirname, ".env") });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { readFileSync } from "fs";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

const ssl =
  databaseUrl.includes("sslmode=require") ||
  databaseUrl.includes("sslmode=verify-ca") ||
  databaseUrl.includes("sslmode=verify-full")
    ? { rejectUnauthorized: false }
    : undefined;

// adapter ve pool değişkenlerini tanımla
const pool = new Pool({ connectionString: databaseUrl, ssl });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  try {
    console.log("Starting database restore from JSON...");
    // Doğrudan mutlak yolu kullan
    const jsonBackupPath = "d:\\Downloads\\database_20260202_114626.json";
    const jsonData = JSON.parse(readFileSync(jsonBackupPath, 'utf8'));

    // Clear existing data in a safe order to avoid foreign key constraints
    console.log("Clearing existing data before restore...");
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
    await prisma.siteSetting.deleteMany();
    await prisma.listingCounter.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.socialLink.deleteMany();
    await prisma.footerItem.deleteMany();
    await prisma.banner.deleteMany();
    await prisma.blogPost.deleteMany();
    await prisma.listingLabel.deleteMany();
    console.log("Existing data cleared.");

    // Restore data in a safe order
    console.log("Restoring data from JSON...");

    // Helper function to convert date strings to Date objects if they exist
    const processDates = <T extends Record<string, any>>(item: T): T => {
      const newItem: any = { ...item }; // newItem'ı any olarak dönüştür
      if (typeof newItem.createdAt === 'string') {
        newItem.createdAt = new Date(newItem.createdAt);
      }
      if (typeof newItem.updatedAt === 'string') {
        newItem.updatedAt = new Date(newItem.updatedAt);
      }
      return newItem as T; // Sonucu tekrar T olarak dönüştür
    };

    // Users
    if (jsonData.users) {
      for (const user of jsonData.users) {
        const processedUser = processDates(user);
        await prisma.user.upsert({
          where: { id: processedUser.id },
          update: processedUser,
          create: processedUser,
        });
      }
      console.log(`${jsonData.users.length} users restored.`);
    }

    // Cities
    if (jsonData.cities) {
      for (const city of jsonData.cities) {
        const processedCity = processDates(city);
        await prisma.city.upsert({
          where: { id: processedCity.id },
          update: processedCity,
          create: processedCity,
        });
      }
      console.log(`${jsonData.cities.length} cities restored.`);
    }

    // Districts
    if (jsonData.districts) {
      for (const district of jsonData.districts) {
        const processedDistrict = processDates(district);
        await prisma.district.upsert({
          where: { id: processedDistrict.id },
          update: processedDistrict,
          create: processedDistrict,
        });
      }
      console.log(`${jsonData.districts.length} districts restored.`);
    }

    // Neighborhoods
    if (jsonData.neighborhoods) {
      for (const neighborhood of jsonData.neighborhoods) {
        const processedNeighborhood = processDates(neighborhood);
        await prisma.neighborhood.upsert({
          where: { id: processedNeighborhood.id },
          update: processedNeighborhood,
          create: processedNeighborhood,
        });
      }
      console.log(`${jsonData.neighborhoods.length} neighborhoods restored.`);
    }

    // Branches
    if (jsonData.branches) {
      for (const branch of jsonData.branches) {
        const processedBranch = processDates(branch);
        await prisma.branch.upsert({
          where: { id: processedBranch.id },
          update: processedBranch,
          create: processedBranch,
        });
      }
      console.log(`${jsonData.branches.length} branches restored.`);
    }

    // Consultants
    if (jsonData.consultants) {
      for (const consultant of jsonData.consultants) {
        const processedConsultant = processDates(consultant);
        await prisma.consultant.upsert({
          where: { id: processedConsultant.id },
          update: processedConsultant,
          create: processedConsultant,
        });
      }
      console.log(`${jsonData.consultants.length} consultants restored.`);
    }

    // Site Settings
    if (jsonData.siteSettings) {
      for (const siteSetting of jsonData.siteSettings) {
        const processedSiteSetting = processDates(siteSetting);
        await prisma.siteSetting.upsert({
          where: { id: processedSiteSetting.id },
          update: processedSiteSetting,
          create: processedSiteSetting,
        });
      }
      console.log(`${jsonData.siteSettings.length} site settings restored.`);
    }

    // City Buttons
    if (jsonData.cityButtons) {
      for (const cityButton of jsonData.cityButtons) {
        const processedCityButton = processDates(cityButton);
        await prisma.cityButton.upsert({
          where: { id: processedCityButton.id },
          update: processedCityButton,
          create: processedCityButton,
        });
      }
      console.log(`${jsonData.cityButtons.length} city buttons restored.`);
    }

    // Action Buttons
    if (jsonData.actionButtons) {
      for (const actionButton of jsonData.actionButtons) {
        const processedActionButton = processDates(actionButton);
        await prisma.actionButton.upsert({
          where: { id: processedActionButton.id },
          update: processedActionButton,
          create: processedActionButton,
        });
      }
      console.log(`${jsonData.actionButtons.length} action buttons restored.`);
    }

    // Listing Attribute Definitions
    if (jsonData.listingAttributeDefinitions) {
      for (const attrDef of jsonData.listingAttributeDefinitions) {
        const processedAttrDef = processDates(attrDef);
        await prisma.listingAttributeDefinition.upsert({
          where: { id: processedAttrDef.id },
          update: processedAttrDef,
          create: processedAttrDef,
        });
      }
      console.log(`${jsonData.listingAttributeDefinitions.length} listing attribute definitions restored.`);
    }

    // Listings (remove nested images relation before upserting)
    if (jsonData.listings) {
      for (const listing of jsonData.listings) {
        const processedListing = processDates(listing);
        // Remove nested images - they will be handled separately
        const { images, ...listingData } = processedListing;
        await prisma.listing.upsert({
          where: { id: listingData.id },
          update: listingData,
          create: listingData,
        });
      }
      console.log(`${jsonData.listings.length} listings restored.`);
    }

    // Listing Images
    if (jsonData.listingImages) {
      for (const image of jsonData.listingImages) {
        const processedImage = processDates(image);
        await prisma.listingImage.upsert({
          where: { id: processedImage.id },
          update: processedImage,
          create: processedImage,
        });
      }
      console.log(`${jsonData.listingImages.length} listing images restored.`);
    }

    // Consultant Requests
    if (jsonData.consultantRequests) {
      for (const req of jsonData.consultantRequests) {
        const processedReq = processDates(req);
        await prisma.consultantRequest.upsert({
          where: { id: processedReq.id },
          update: processedReq,
          create: processedReq,
        });
      }
      console.log(`${jsonData.consultantRequests.length} consultant requests restored.`);
    }

    // Customer Requests
    if (jsonData.customerRequests) {
      for (const req of jsonData.customerRequests) {
        const processedReq = processDates(req);
        await prisma.customerRequest.upsert({
          where: { id: processedReq.id },
          update: processedReq,
          create: processedReq,
        });
      }
      console.log(`${jsonData.customerRequests.length} customer requests restored.`);
    }

    // Listing Counters
    if (jsonData.listingCounters) {
      for (const counter of jsonData.listingCounters) {
        const processedCounter = processDates(counter);
        await prisma.listingCounter.upsert({
          where: { id: processedCounter.id },
          update: processedCounter,
          create: processedCounter,
        });
      }
      console.log(`${jsonData.listingCounters.length} listing counters restored.`);
    }

    // Menu Items
    if (jsonData.menuItems) {
      for (const menuItem of jsonData.menuItems) {
        const processedMenuItem = processDates(menuItem);
        await prisma.menuItem.upsert({
          where: { id: processedMenuItem.id },
          update: processedMenuItem,
          create: processedMenuItem,
        });
      }
      console.log(`${jsonData.menuItems.length} menu items restored.`);
    }

    // Social Links
    if (jsonData.socialLinks) {
      for (const socialLink of jsonData.socialLinks) {
        const processedSocialLink = processDates(socialLink);
        await prisma.socialLink.upsert({
          where: { id: processedSocialLink.id },
          update: processedSocialLink,
          create: processedSocialLink,
        });
      }
      console.log(`${jsonData.socialLinks.length} social links restored.`);
    }

    // Footer Items
    if (jsonData.footerItems) {
      for (const footerItem of jsonData.footerItems) {
        const processedFooterItem = processDates(footerItem);
        await prisma.footerItem.upsert({
          where: { id: processedFooterItem.id },
          update: processedFooterItem,
          create: processedFooterItem,
        });
      }
      console.log(`${jsonData.footerItems.length} footer items restored.`);
    }

    // Banners
    if (jsonData.banners) {
      for (const banner of jsonData.banners) {
        const processedBanner = processDates(banner);
        await prisma.banner.upsert({
          where: { id: processedBanner.id },
          update: processedBanner,
          create: processedBanner,
        });
      }
      console.log(`${jsonData.banners.length} banners restored.`);
    }

    // Blog Posts
    if (jsonData.blogPosts) {
      for (const blogPost of jsonData.blogPosts) {
        const processedBlogPost = processDates(blogPost);
        await prisma.blogPost.upsert({
          where: { id: processedBlogPost.id },
          update: processedBlogPost,
          create: processedBlogPost,
        });
      }
      console.log(`${jsonData.blogPosts.length} blog posts restored.`);
    }

    // Listing Labels
    if (jsonData.listingLabels) {
      for (const listingLabel of jsonData.listingLabels) {
        const processedListingLabel = processDates(listingLabel);
        await prisma.listingLabel.upsert({
          where: { id: processedListingLabel.id },
          update: processedListingLabel,
          create: processedListingLabel,
        });
      }
      console.log(`${jsonData.listingLabels.length} listing labels restored.`);
    }

    console.log("Database restore from JSON completed successfully!");
  } catch (e) {
    console.error("Error during database restore from JSON:", e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
