import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseEntries: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date() },
    { url: `${siteUrl}/firsatlar`, lastModified: new Date() },
  ];

  try {
    const [citiesRes, listingsRes] = await Promise.all([
      fetch(`${apiUrl}/cities`, { cache: "no-store" }),
      fetch(`${apiUrl}/listings`, { cache: "no-store" }),
    ]);

    const [cities, listings] = await Promise.all([
      citiesRes.ok ? citiesRes.json() : [],
      listingsRes.ok ? listingsRes.json() : [],
    ]);

    const cityEntries = (cities as { slug: string }[]).map((city) => ({
      url: `${siteUrl}/${city.slug}`,
      lastModified: new Date(),
    }));

    const listingEntries = (listings as { id: string }[]).map((listing) => ({
      url: `${siteUrl}/listings/${listing.id}`,
      lastModified: new Date(),
    }));

    return [...baseEntries, ...cityEntries, ...listingEntries];
  } catch {
    return baseEntries;
  }
}
