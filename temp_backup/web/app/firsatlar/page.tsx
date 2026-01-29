import Link from "next/link";
import { fetchJson } from "../../lib/api";
import {
  buildListingFeatures,
  formatPrice,
  getStatusClass,
  getStatusLabel,
  resolveImageUrl,
} from "../../lib/listings";

type Listing = {
  id: string;
  title: string;
  price?: string | null;
  status?: string | null;
  city?: { name: string } | null;
  attributes?: Record<string, unknown> | null;
  areaNet?: string | null;
  areaGross?: string | null;
  propertyType?: string | null;
  images?: { url: string; isCover?: boolean | null }[] | null;
};

async function getOpportunities() {
  return fetchJson<Listing[]>("/listings?isOpportunity=true", {
    cache: "no-store",
  });
}

export default async function OpportunitiesPage() {
  const listings = await getOpportunities();

  return (
    <main className="section">
      <div className="container">
        <div className="section-title">Fırsatlar</div>
        <div className="card-grid">
          {listings.length === 0 ? (
            <div className="card">
              <div className="card-body">Henüz fırsat ilanı yok.</div>
            </div>
          ) : null}
          {listings.map((listing) => (
            <div key={listing.id} className="card">
              {(() => {
                const coverImageUrl = resolveImageUrl(
                  listing.images?.find((image) => image.isCover)?.url ||
                    listing.images?.[0]?.url,
                );

                if (!coverImageUrl) {
                  return <div style={{ background: "#cbd5f5", height: 160 }} />;
                }

                return (
                  <img
                    src={coverImageUrl}
                    alt={listing.title}
                    style={{ height: 160, width: "100%", objectFit: "cover" }}
                  />
                );
              })()}
              <div className="card-body">
                <span className={`badge ${getStatusClass(listing.status)}`}>
                  {getStatusLabel(listing.status)}
                </span>
                <div style={{ fontWeight: 700, marginTop: 8 }}>
                  {listing.title}
                </div>
                <div style={{ color: "var(--color-muted)", marginTop: 4 }}>
                  {listing.city?.name ?? "Türkiye"} · {formatPrice(listing.price)}
                </div>
                <div className="icon-row">
                  {buildListingFeatures(listing).map((feature) => (
                    <span key={feature}>{feature}</span>
                  ))}
                </div>
                <Link href={`/listings/${listing.id}`} className="btn btn-outline">
                  Detay
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
