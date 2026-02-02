import type { Metadata } from "next";
import ValuationPageClient from "./ValuationPageClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// SEO için metadata
export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch(`${API_BASE_URL}/settings`, { cache: "no-store" });
    const settings = await res.json();

    return {
      title: settings.valuationPageTitle || "Evim Ne Kadar Eder? | Ücretsiz Değerleme",
      description: settings.valuationPageDescription || "Gayrimenkulünüzün güncel piyasa değerini öğrenin. Uzman ekibimiz ücretsiz değerleme hizmeti sunuyor.",
      keywords: "ev değerleme, gayrimenkul değerleme, ücretsiz değerleme, emlak değerleme, konut değerleme",
      openGraph: {
        title: settings.valuationPageTitle || "Evim Ne Kadar Eder? | Ücretsiz Değerleme",
        description: settings.valuationPageDescription || "Gayrimenkulünüzün güncel piyasa değerini öğrenin.",
        type: "website",
        images: settings.ogImage ? [{ url: settings.ogImage }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: settings.valuationPageTitle || "Evim Ne Kadar Eder?",
        description: settings.valuationPageDescription || "Gayrimenkulünüzün değerini öğrenin.",
      },
    };
  } catch {
    return {
      title: "Evim Ne Kadar Eder? | Ücretsiz Değerleme",
      description: "Gayrimenkulünüzün güncel piyasa değerini öğrenin. Uzman ekibimiz ücretsiz değerleme hizmeti sunuyor.",
    };
  }
}

export default function ValuationPage() {
  return <ValuationPageClient />;
}
