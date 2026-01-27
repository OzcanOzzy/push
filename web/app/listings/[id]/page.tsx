import { fetchJsonOptional } from "../../../lib/api";
import type { Metadata } from "next";
import {
  buildListingFeatures,
  formatPrice,
  getStatusLabel,
  resolveImageUrl,
} from "../../../lib/listings";

type ListingDetailProps = {
  params: { id: string };
};

type Listing = {
  id: string;
  title: string;
  description: string;
  status?: string | null;
  price?: string | null;
  city?: { name: string } | null;
  attributes?: Record<string, unknown> | null;
  areaNet?: string | null;
  areaGross?: string | null;
  propertyType?: string | null;
  images?: { url: string; isCover?: boolean | null }[] | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  consultant?: {
    user?: { name?: string | null } | null;
    contactPhone?: string | null;
    whatsappNumber?: string | null;
  } | null;
};

async function getListing(id: string) {
  return fetchJsonOptional<Listing>(`/listings/${id}`, { cache: "no-store" });
}

export async function generateMetadata({
  params,
}: ListingDetailProps): Promise<Metadata> {
  const listing = await getListing(params.id);
  if (!listing) {
    return {
      title: "İlan Bulunamadı - Emlaknomi",
    };
  }

  return {
    title: `${listing.title} - Emlaknomi`,
    description: listing.description?.slice(0, 160) || "Emlaknomi ilan detayı.",
  };
}

export default async function ListingDetailPage({ params }: ListingDetailProps) {
  const listing = await getListing(params.id);

  if (!listing) {
    return (
      <main className="section">
        <div className="container">
          <div className="section-title">İlan bulunamadı</div>
          <div className="card">
            <div className="card-body">
              İstediğiniz ilan bulunamadı veya yayından kaldırılmış olabilir.
            </div>
          </div>
        </div>
      </main>
    );
  }

  const contactName = listing.consultant?.user?.name || "Danışman";
  const contactPhone = listing.consultant?.contactPhone || "0543 306 14 99";
  const whatsappNumber = listing.consultant?.whatsappNumber || contactPhone;
  const coverImageUrl = resolveImageUrl(
    listing.images?.find((image) => image.isCover)?.url ||
      listing.images?.[0]?.url,
  );
  const latitude = listing.latitude ? Number(listing.latitude) : null;
  const longitude = listing.longitude ? Number(listing.longitude) : null;
  const hasLocation =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude !== null &&
    longitude !== null;

  return (
    <main className="section">
      <div className="container">
        <div className="section-title">İlan Detayı #{params.id}</div>
        <div style={{ display: "grid", gap: 20 }}>
          <div className="card">
            {coverImageUrl ? (
              <img
                src={coverImageUrl}
                alt={listing.title}
                style={{ height: 320, width: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ background: "#cbd5f5", height: 320 }} />
            )}
            <div className="card-body">
              <div style={{ fontWeight: 700, fontSize: 18 }}>
                {listing.title}
              </div>
              <div style={{ color: "var(--color-muted)", marginTop: 6 }}>
                {listing.city?.name ?? "Türkiye"} · {formatPrice(listing.price)}
              </div>
              <div className="icon-row">
                {buildListingFeatures(listing).map((feature) => (
                  <span key={feature}>{feature}</span>
                ))}
              </div>
              <p style={{ marginTop: 12 }}>
                {listing.description}
              </p>
              <div style={{ marginTop: 12, fontWeight: 600 }}>
                Durum: {getStatusLabel(listing.status)}
              </div>
            </div>
          </div>
          {listing.images && listing.images.length > 1 ? (
            <div className="card">
              <div className="card-body">
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Galeri</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
                  {listing.images.map((image) => (
                    <img
                      key={image.url}
                      src={resolveImageUrl(image.url) ?? ""}
                      alt={listing.title}
                      style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 8 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : null}
          {hasLocation ? (
            <div className="card">
              <div className="card-body">
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Konum</div>
                <iframe
                  title="Konum Haritası"
                  width="100%"
                  height="260"
                  style={{ border: 0, borderRadius: 12 }}
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                    longitude - 0.01
                  }%2C${latitude - 0.01}%2C${longitude + 0.01}%2C${
                    latitude + 0.01
                  }&layer=mapnik&marker=${latitude}%2C${longitude}`}
                />
              </div>
            </div>
          ) : (
            <div className="map-placeholder">Konum haritası</div>
          )}
          <div className="card">
            <div className="card-body">
              <div style={{ fontWeight: 700 }}>Danışman Bilgileri</div>
              <div>{contactName}</div>
              <div style={{ color: "var(--color-muted)" }}>{contactPhone}</div>
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <button className="btn">WhatsApp</button>
                <button className="btn btn-outline">Ara</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
