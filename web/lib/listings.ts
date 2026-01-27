type ListingLike = {
  attributes?: Record<string, unknown> | null;
  areaNet?: number | string | null;
  areaGross?: number | string | null;
  propertyType?: string | null;
};

export function formatPrice(value?: number | string | null) {
  if (value === null || value === undefined) {
    return "";
  }

  const numericValue = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return `${new Intl.NumberFormat("tr-TR").format(numericValue)} TL`;
}

export function getStatusLabel(status?: string | null) {
  if (status === "FOR_RENT") {
    return "Kiralık";
  }
  if (status === "FOR_SALE") {
    return "Satılık";
  }
  return "İlan";
}

export function getStatusClass(status?: string | null) {
  return status === "FOR_RENT" ? "rent" : "sale";
}

export function buildListingFeatures(listing: ListingLike) {
  const attributes = listing.attributes ?? {};
  const rooms = typeof attributes.rooms === "string" ? attributes.rooms : null;

  return [
    rooms,
    listing.areaNet ? `${listing.areaNet} m² (Net)` : null,
    listing.areaGross ? `${listing.areaGross} m² (Brüt)` : null,
    listing.propertyType ?? null,
  ].filter(Boolean) as string[];
}

export function resolveImageUrl(url?: string | null) {
  if (!url) {
    return null;
  }

  if (url.startsWith("http")) {
    return url;
  }

  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  return `${base}${url}`;
}
