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

type CityPageProps = {
  params: { city: string };
  searchParams?: {
    status?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    districtId?: string;
    neighborhoodId?: string;
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

type City = {
  id: string;
  name: string;
  slug: string;
};

type District = {
  id: string;
  name: string;
};

type Neighborhood = {
  id: string;
  name: string;
};

async function getCities() {
  return fetchJson<City[]>("/cities", { cache: "no-store" });
}

async function getDistricts(cityId?: string | null) {
  if (!cityId) {
    return [];
  }
  return fetchJson<District[]>(`/districts?cityId=${cityId}`, {
    cache: "no-store",
  });
}

async function getNeighborhoods(districtId?: string | null) {
  if (!districtId) {
    return [];
  }
  return fetchJson<Neighborhood[]>(`/neighborhoods?districtId=${districtId}`, {
    cache: "no-store",
  });
}

export async function generateMetadata({
  params,
}: CityPageProps): Promise<Metadata> {
  const cities = await getCities();
  const city = cities.find((item) => item.slug === params.city);
  const title = city ? `${city.name} Şubesi - Emlaknomi` : "Şube - Emlaknomi";

  return {
    title,
    description: `${title} için güncel ilanlar ve fırsatlar.`,
  };
}

async function getCityListings(
  citySlug: string,
  filters: {
    status?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    districtId?: string;
    neighborhoodId?: string;
  },
) {
  const params = new URLSearchParams({ citySlug });
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
  if (filters.districtId) {
    params.set("districtId", filters.districtId);
  }
  if (filters.neighborhoodId) {
    params.set("neighborhoodId", filters.neighborhoodId);
  }

  return fetchJson<Listing[]>(`/listings?${params.toString()}`, {
    cache: "no-store",
  });
}

export default async function CityPage({ params, searchParams }: CityPageProps) {
  const cities = await getCities();
  const selectedCity = cities.find((city) => city.slug === params.city);
  const districts = await getDistricts(selectedCity?.id);
  const neighborhoods = await getNeighborhoods(searchParams?.districtId);
  const listings = await getCityListings(params.city, {
    status: searchParams?.status,
    category: searchParams?.category,
    minPrice: searchParams?.minPrice,
    maxPrice: searchParams?.maxPrice,
    districtId: searchParams?.districtId,
    neighborhoodId: searchParams?.neighborhoodId,
  });
  const cityName =
    listings[0]?.city?.name ?? params.city.replace(/-/g, " ").toUpperCase();
  const activeStatus = searchParams?.status;
  const activeCategory = searchParams?.category;
  const activeMinPrice = searchParams?.minPrice ?? "";
  const activeMaxPrice = searchParams?.maxPrice ?? "";
  const activeDistrictId = searchParams?.districtId ?? "";
  const activeNeighborhoodId = searchParams?.neighborhoodId ?? "";

  const buildUrlWithPrice = (
    status?: string,
    category?: string,
    minPrice?: string,
    maxPrice?: string,
    districtId?: string,
    neighborhoodId?: string,
  ) => {
    const queryParams = new URLSearchParams();
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
    if (districtId) {
      queryParams.set("districtId", districtId);
    }
    if (neighborhoodId) {
      queryParams.set("neighborhoodId", neighborhoodId);
    }
    const query = queryParams.toString();
    return query ? `/${params.city}?${query}` : `/${params.city}`;
  };

  const buildUrl = (status?: string, category?: string) => {
    return buildUrlWithPrice(
      status,
      category,
      activeMinPrice,
      activeMaxPrice,
      activeDistrictId,
      activeNeighborhoodId,
    );
  };

  return (
    <main className="section">
      <div className="container">
        <div className="section-title">{cityName} Şubesi</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <Link
            className="btn btn-outline"
            href={buildUrl("FOR_SALE", activeCategory)}
          >
            Satılık
          </Link>
          <Link
            className="btn btn-outline"
            href={buildUrl("FOR_RENT", activeCategory)}
          >
            Kiralık
          </Link>
          <Link className="btn btn-outline" href={buildUrl(undefined, activeCategory)}>
            Tümü
          </Link>
        </div>
        <div className="layout-grid">
          <aside className="sidebar">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Filtreler</div>
            <div style={{ display: "grid", gap: 8 }}>
              <form
                style={{ display: "grid", gap: 8 }}
                method="GET"
                action={`/${params.city}`}
              >
                <input type="hidden" name="status" value={activeStatus ?? ""} />
                <input type="hidden" name="category" value={activeCategory ?? ""} />
                <input type="hidden" name="districtId" value={activeDistrictId} />
                <input type="hidden" name="neighborhoodId" value={activeNeighborhoodId} />
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
                  Fiyat Filtrele
                </button>
                <Link
                  className="btn btn-outline"
                  href={buildUrlWithPrice(
                    activeStatus,
                    activeCategory,
                    "",
                    "",
                    activeDistrictId,
                    activeNeighborhoodId,
                  )}
                >
                  Fiyat Temizle
                </Link>
              </form>
              <form
                style={{ display: "grid", gap: 8 }}
                method="GET"
                action={`/${params.city}`}
              >
                <input type="hidden" name="status" value={activeStatus ?? ""} />
                <input type="hidden" name="category" value={activeCategory ?? ""} />
                <input type="hidden" name="minPrice" value={activeMinPrice} />
                <input type="hidden" name="maxPrice" value={activeMaxPrice} />
                <select
                  className="search-input"
                  name="districtId"
                  defaultValue={activeDistrictId}
                >
                  <option value="">İlçe seçin</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
                <select
                  className="search-input"
                  name="neighborhoodId"
                  defaultValue={activeNeighborhoodId}
                  disabled={!activeDistrictId}
                >
                  <option value="">Mahalle seçin</option>
                  {neighborhoods.map((neighborhood) => (
                    <option key={neighborhood.id} value={neighborhood.id}>
                      {neighborhood.name}
                    </option>
                  ))}
                </select>
                <button className="btn btn-outline" type="submit">
                  Konum Filtrele
                </button>
                <Link
                  className="btn btn-outline"
                  href={buildUrlWithPrice(activeStatus, activeCategory, activeMinPrice, activeMaxPrice)}
                >
                  Konum Temizle
                </Link>
              </form>
              <Link
                className="btn btn-outline"
                href={buildUrl(activeStatus, "HOUSING")}
              >
                Konut
              </Link>
              <Link
                className="btn btn-outline"
                href={buildUrl(activeStatus, "LAND")}
              >
                Arsa
              </Link>
              <Link
                className="btn btn-outline"
                href={buildUrl(activeStatus, "COMMERCIAL")}
              >
                Ticari
              </Link>
              <Link
                className="btn btn-outline"
                href={buildUrl(activeStatus, "FIELD")}
              >
                Tarla
              </Link>
              <Link
                className="btn btn-outline"
                href={buildUrl(activeStatus, "GARDEN")}
              >
                Bahçe
              </Link>
              <Link
                className="btn btn-outline"
                href={buildUrl(activeStatus, "TRANSFER")}
              >
                Devren
              </Link>
              <Link className="btn btn-outline" href={buildUrl(activeStatus, undefined)}>
                Tüm Kategoriler
              </Link>
            </div>
          </aside>
          <section className="card-grid">
            {listings.length === 0 ? (
              <div className="card">
                <div className="card-body">
                  Bu şehir için henüz ilan bulunmuyor.
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
                  <span
                    className={`badge ${getStatusClass(listing.status)}`}
                  >
                    {getStatusLabel(listing.status)}
                  </span>
                  <div style={{ fontWeight: 700, marginTop: 8 }}>
                    {listing.title}
                  </div>
                  <div style={{ color: "var(--color-muted)", marginTop: 4 }}>
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
          </section>
        </div>
      </div>
    </main>
  );
}
