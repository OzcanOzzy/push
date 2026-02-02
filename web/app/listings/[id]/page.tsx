import { Metadata } from "next";
import { notFound } from "next/navigation";
import ListingDetailClient from "./ListingDetailClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type ListingImage = {
  id: string;
  url: string;
  isCover: boolean;
  sortOrder: number;
};

type Listing = {
  id: string;
  listingNo: string;
  title: string;
  slug: string | null;
  description: string | null;
  price: number;
  currency: string;
  status: "FOR_SALE" | "FOR_RENT";
  category: string;
  subPropertyType: string | null;
  areaGross: number | null;
  areaNet: number | null;
  isOpportunity: boolean;
  latitude: number | null;
  longitude: number | null;
  hideLocation: boolean;
  googleMapsUrl: string | null;
  videoUrl: string | null;
  virtualTourUrl: string | null;
  virtualTourType: string | null;
  attributes: Record<string, unknown> | null;
  images: ListingImage[];
  city?: { name: string } | null;
  district?: { name: string } | null;
  neighborhood?: { name: string } | null;
  branch?: { id: string; name: string; phone?: string; whatsappNumber?: string; address?: string } | null;
  consultant?: { id: string; photoUrl?: string; title?: string; whatsappNumber?: string; contactPhone?: string; user?: { name: string } } | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogImage: string | null;
  createdAt: string;
  updatedAt: string;
};

async function getListing(id: string): Promise<Listing | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/listings/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// SEO Metadata
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) {
    return {
      title: "İlan Bulunamadı",
    };
  }

  const title = listing.metaTitle || `${listing.title} | İlan No: ${listing.listingNo}`;
  const description = listing.metaDescription || listing.description?.slice(0, 160) || `${listing.title} - ${listing.city?.name || ""}`;
  const image = listing.ogImage || listing.images?.[0]?.url;

  return {
    title,
    description,
    keywords: listing.metaKeywords || undefined,
    openGraph: {
      title,
      description,
      images: image ? [image] : undefined,
      type: "website",
      locale: "tr_TR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) {
    notFound();
  }

  return <ListingDetailClient listing={listing} />;
}
