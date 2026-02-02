import type { Metadata } from "next";
import PropertyRequestPageClient from "./PropertyRequestPageClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// SEO için metadata
export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch(`${API_BASE_URL}/settings`, { cache: "no-store" });
    const settings = await res.json();

    return {
      title: settings.propertyRequestPageTitle || "Satmak veya Kiralamak İstiyorum | Gayrimenkul Satış ve Kiralama",
      description: settings.propertyRequestPageDescription || "Gayrimenkulünüzü satmak veya kiralamak mı istiyorsunuz? Profesyonel emlak danışmanlarımız size yardımcı olsun.",
      keywords: "ev satmak, daire satmak, ev kiralamak, gayrimenkul satış, emlak kiralama, konut satış",
      openGraph: {
        title: settings.propertyRequestPageTitle || "Satmak veya Kiralamak İstiyorum",
        description: settings.propertyRequestPageDescription || "Gayrimenkulünüzü satmak veya kiralamak mı istiyorsunuz?",
        type: "website",
        images: settings.ogImage ? [{ url: settings.ogImage }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: settings.propertyRequestPageTitle || "Satmak veya Kiralamak İstiyorum",
        description: settings.propertyRequestPageDescription || "Gayrimenkulünüzü satmak veya kiralamak mı istiyorsunuz?",
      },
    };
  } catch {
    return {
      title: "Satmak veya Kiralamak İstiyorum | Gayrimenkul Satış ve Kiralama",
      description: "Gayrimenkulünüzü satmak veya kiralamak mı istiyorsunuz? Profesyonel emlak danışmanlarımız size yardımcı olsun.",
    };
  }
}

export default function PropertyRequestPage() {
  return <PropertyRequestPageClient />;
}
