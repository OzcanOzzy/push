import Link from "next/link";
import type { Metadata } from "next";
import { fetchJson } from "../../lib/api";
import {
  buildListingFeatures,
  formatPrice,
  getStatusClass,
  getStatusLabel,
  resolveImageUrl,
} from "../../lib/listings";

type SearchPageProps = {
  searchParams?: {
    q?: string;
    status?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
  };
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

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const query = searchParams?.q;
  const title = query
    ? `"${query}" için arama sonuçları - Emlaknomi`
    : "Tüm İlanlar - Emlaknomi";

  return {
    title,
    description: "Emlaknomi'de tüm ilanları arayın ve filtreleyin.",
  };
}

async function searchListings(filters: {
  q?: string;
  status?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
}) {
  const params = new URLSearchParams();
  if (filters.q) {
    params.set("q", filters.q);
  }
  if (filters.status) {
    params.set("status", filters.status);
  }
  if (filters.category) {
    params.set("category", filters.category);
  }
  if (filters.minPrice) {
    params.set("minPrice", filters.minPrice);
  }
  if (filters.maxPrice) {
    params.set("maxPrice", filters.maxPrice);
  }

  const queryStr = params.toString();
  return fetchJson<Listing[]>(`/listings${queryStr ? `?${queryStr}` : ""}`, {
    cache: "no-store",
  });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const listings = await searchListings({
    q: searchParams?.q,
    status: searchParams?.status,
    category: searchParams?.category,
    minPrice: searchParams?.minPrice,
    maxPrice: searchParams?.maxPrice,
  });

  const activeQuery = searchParams?.q ?? "";
  const activeStatus = searchParams?.status;
  const activeCategory = searchParams?.category;
  const activeMinPrice = searchParams?.minPrice ?? "";
  const activeMaxPrice = searchParams?.maxPrice ?? "";

  const buildUrl = (
    q?: string,
    status?: string,
    category?: string,
    minPrice?: string,
    maxPrice?: string,
  ) => {
    const queryParams = new URLSearchParams();
    if (q) {
      queryParams.set("q", q);
    }
    if (status) {
      queryParams.set("status", status);
    }
    if (category) {
      queryParams.set("category", category);
    }
    if (minPrice) {
      queryParams.set("minPrice", minPrice);
    }
    if (maxPrice) {
      queryParams.set("maxPrice", maxPrice);
    }
    const query = queryParams.toString();
    return query ? `/arama?${query}` : "/arama";
  };

  return (
    <main className="section">
      <div className="container">
        <div className="section-title">
          {activeQuery ? `"${activeQuery}" için sonuçlar` : "Tüm İlanlar"}
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <Link
            className={`btn ${activeStatus === "FOR_SALE" ? "" : "btn-outline"}`}
            href={buildUrl(activeQuery, "FOR_SALE", activeCategory, activeMinPrice, activeMaxPrice)}
          >
            Satılık
          </Link>
          <Link
            className={`btn ${activeStatus === "FOR_RENT" ? "" : "btn-outline"}`}
            href={buildUrl(activeQuery, "FOR_RENT", activeCategory, activeMinPrice, activeMaxPrice)}
          >
            Kiralık
          </Link>
          <Link
            className={`btn ${!activeStatus ? "" : "btn-outline"}`}
            href={buildUrl(activeQuery, undefined, activeCategory, activeMinPrice, activeMaxPrice)}
          >
            Tümü
          </Link>
        </div>
        <div className="layout-grid">
          <aside className="sidebar">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Filtreler</div>
            <div style={{ display: "grid", gap: 8 }}>
              <form style={{ display: "grid", gap: 8 }} method="GET" action="/arama">
                <input type="hidden" name="status" value={activeStatus ?? ""} />
                <input type="hidden" name="category" value={activeCategory ?? ""} />
                <input
                  className="search-input"
                  name="q"
                  placeholder="Anahtar kelime"
                  defaultValue={activeQuery}
                />
                <input
                  className="search-input"
                  name="minPrice"
                  placeholder="Min fiyat (TL)"
                  defaultValue={activeMinPrice}
                />
                <input
                  className="search-input"
                  name="maxPrice"
                  placeholder="Max fiyat (TL)"
                  defaultValue={activeMaxPrice}
                />
                <button className="btn btn-outline" type="submit">
                  Filtrele
                </button>
                <Link className="btn btn-outline" href="/arama">
                  Temizle
                </Link>
              </form>
              <div style={{ fontWeight: 600, marginTop: 12 }}>Kategori</div>
              <Link
                className={`btn ${activeCategory === "HOUSING" ? "" : "btn-outline"}`}
                href={buildUrl(activeQuery, activeStatus, "HOUSING", activeMinPrice, activeMaxPrice)}
              >
                Konut
              </Link>
              <Link
                className={`btn ${activeCategory === "LAND" ? "" : "btn-outline"}`}
                href={buildUrl(activeQuery, activeStatus, "LAND", activeMinPrice, activeMaxPrice)}
              >
                Arsa
              </Link>
              <Link
                className={`btn ${activeCategory === "COMMERCIAL" ? "" : "btn-outline"}`}
                href={buildUrl(activeQuery, activeStatus, "COMMERCIAL", activeMinPrice, activeMaxPrice)}
              >
                Ticari
              </Link>
              <Link
                className={`btn ${activeCategory === "FIELD" ? "" : "btn-outline"}`}
                href={buildUrl(activeQuery, activeStatus, "FIELD", activeMinPrice, activeMaxPrice)}
              >
                Tarla
              </Link>
              <Link
                className={`btn ${activeCategory === "GARDEN" ? "" : "btn-outline"}`}
                href={buildUrl(activeQuery, activeStatus, "GARDEN", activeMinPrice, activeMaxPrice)}
              >
                Bahçe
              </Link>
              <Link
                className={`btn ${activeCategory === "TRANSFER" ? "" : "btn-outline"}`}
                href={buildUrl(activeQuery, activeStatus, "TRANSFER", activeMinPrice, activeMaxPrice)}
              >
                Devren
              </Link>
              <Link
                className={`btn ${!activeCategory ? "" : "btn-outline"}`}
                href={buildUrl(activeQuery, activeStatus, undefined, activeMinPrice, activeMaxPrice)}
              >
                Tüm Kategoriler
              </Link>
            </div>
          </aside>
          <section className="card-grid">
            {listings.length === 0 ? (
              <div className="card">
                <div className="card-body">
                  Arama kriterlerinize uygun ilan bulunamadı.
                </div>
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
                    {listing.city?.name} · {formatPrice(listing.price)}
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
          </section>
        </div>
      </div>
    </main>
  );
}
