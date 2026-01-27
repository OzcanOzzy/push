import Link from "next/link";
import { fetchJson } from "../lib/api";
import {
  buildListingFeatures,
  formatPrice,
  getStatusClass,
  getStatusLabel,
  resolveImageUrl,
} from "../lib/listings";

type Branch = {
  id: string;
  name: string;
  slug: string;
  city?: { name: string; slug: string } | null;
};

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

async function getHomeData() {
  const [branches, listings] = await Promise.all([
    fetchJson<Branch[]>("/branches", { cache: "no-store" }),
    fetchJson<Listing[]>("/listings?take=6", { cache: "no-store" }),
  ]);

  return { branches, listings };
}

export default async function Home() {
  const { branches, listings } = await getHomeData();

  const branchButtons = [
    ...branches,
    { id: "opportunities", name: "Fırsatlar", slug: "firsatlar", city: null },
  ];

  return (
    <main>
      <section className="section">
        <div className="container">
          <div className="section-title">Şubeler</div>
          <div className="branch-grid">
            {branchButtons.map((branch) => (
              <Link
                key={branch.id}
                className={`branch-btn ${
                  branch.slug === "firsatlar" ? "opportunity" : ""
                }`}
                href={`/${branch.city?.slug ?? branch.slug}`}
              >
                {branch.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title">Hızlı İşlemler</div>
          <div className="branch-grid">
            <Link className="branch-btn" href="/requests/customer?type=SELL">
              Satmak / Kiralamak İstiyorum
            </Link>
            <Link className="branch-btn" href="/requests/customer?type=VALUATION">
              Değerleme Talep Formu
            </Link>
            <Link className="branch-btn" href="/requests/customer?type=SELL">
              Değer Artış Kazanç Vergisi
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title">Harita</div>
          <div className="map-placeholder">
            Harita modülü burada görünecek.
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title">Son Yüklenen İlanlar</div>
          <div className="card-grid">
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
                  <span
                    className={`badge ${getStatusClass(listing.status)}`}
                  >
                    {getStatusLabel(listing.status)}
                  </span>
                  <div style={{ fontWeight: 700, marginTop: 8 }}>
                    {listing.title}
                  </div>
                  <div style={{ color: "var(--color-muted)", marginTop: 4 }}>
                    {listing.city?.name ?? "Türkiye"} ·{" "}
                    {formatPrice(listing.price)}
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
      </section>
    </main>
  );
}
