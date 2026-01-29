import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SettingsProvider from "./components/SettingsProvider";
import CorporateHeader from "./components/CorporateHeader";
import CorporateFooter from "./components/CorporateFooter";
import { defaultSettings, type SiteSettings } from "../lib/settings";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fetch settings server-side for SEO
async function getSettings(): Promise<SiteSettings & Record<string, unknown>> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${API_URL}/settings`, { 
      next: { revalidate: 60 }
    });
    if (!res.ok) return defaultSettings;
    const data = await res.json();
    return { ...defaultSettings, ...data };
  } catch (error) {
    return defaultSettings;
  }
}

// Dynamic metadata
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  
  return {
    title: settings.metaTitle || `${settings.siteName || "Emlaknomi"} - ${settings.ownerName || "Gayrimenkul"}`,
    description: settings.metaDescription || "Emlak ilanları, şubeler ve danışman ağı.",
    keywords: settings.metaKeywords || "emlak, gayrimenkul, satılık, kiralık",
    authors: [{ name: settings.ownerName || "Emlaknomi" }],
    creator: settings.ownerName || "Emlaknomi",
    publisher: settings.siteName || "Emlaknomi",
    viewport: {
      width: "device-width",
      initialScale: 1,
      maximumScale: 5,
      userScalable: true,
    },
    themeColor: settings.primaryColor || "#0a4ea3",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: (settings.ogType as "website" | "article") || "website",
      locale: "tr_TR",
      url: settings.canonicalUrl || undefined,
      siteName: settings.siteName || "Emlaknomi",
      title: settings.metaTitle || settings.siteName || "Emlaknomi",
      description: settings.metaDescription || "Emlak ilanları, şubeler ve danışman ağı.",
      images: settings.ogImage ? [{ url: settings.ogImage, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      site: settings.twitterHandle || undefined,
      creator: settings.twitterHandle || undefined,
      title: settings.metaTitle || settings.siteName || "Emlaknomi",
      description: settings.metaDescription || "Emlak ilanları, şubeler ve danışman ağı.",
      images: settings.ogImage ? [settings.ogImage] : [],
    },
    alternates: {
      canonical: settings.canonicalUrl || undefined,
    },
    verification: {
      google: settings.googleSiteVerification || undefined,
      yandex: settings.yandexVerification || undefined,
      other: settings.bingSiteVerification ? { "msvalidate.01": settings.bingSiteVerification } : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialSettings = await getSettings();

  // Build Schema.org JSON-LD
  const schemaOrgJsonLd = {
    "@context": "https://schema.org",
    "@type": initialSettings.schemaOrgType || "RealEstateAgent",
    name: initialSettings.schemaOrgName || initialSettings.siteName || "Emlaknomi",
    description: initialSettings.schemaOrgDescription || initialSettings.metaDescription || "",
    url: initialSettings.canonicalUrl || "",
    telephone: initialSettings.schemaOrgTelephone || initialSettings.phoneNumber || "",
    email: initialSettings.email || "",
    priceRange: initialSettings.schemaOrgPriceRange || "₺₺₺",
    openingHours: initialSettings.schemaOrgOpeningHours || "Mo-Sa 09:00-18:00",
    address: {
      "@type": "PostalAddress",
      streetAddress: initialSettings.schemaOrgAddress || "",
      addressLocality: initialSettings.schemaOrgCity || "",
      addressRegion: initialSettings.schemaOrgRegion || "",
      postalCode: initialSettings.schemaOrgPostalCode || "",
      addressCountry: initialSettings.schemaOrgCountry || "TR",
    },
    image: initialSettings.ogImage || initialSettings.logoUrl || "",
    logo: initialSettings.logoUrl || "",
    sameAs: [
      initialSettings.facebookUrl,
      initialSettings.instagramUrl,
      initialSettings.youtubeUrl,
      initialSettings.linkedinUrl,
      initialSettings.twitterUrl,
    ].filter(Boolean),
  };

  return (
    <html lang="tr">
      <head>
        {/* Mobile Optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#0a4ea3" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Bebas+Neue&family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Inter:wght@400;500;600&family=Lobster&family=Manrope:wght@500;600;700;800&family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@400;500;600&family=Pacifico&family=Playfair+Display:wght@400;700&family=Poppins:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Satisfy&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        
        {/* Critical CSS - Mobile Settings */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            ${initialSettings.mobileHeaderPadding ? `--mobile-header-padding: ${initialSettings.mobileHeaderPadding};` : ''}
            ${initialSettings.mobileNavFontSize ? `--mobile-nav-font-size: ${initialSettings.mobileNavFontSize}px;` : ''}
            ${initialSettings.mobileLogoRowPadding ? `--mobile-logo-row-padding: ${initialSettings.mobileLogoRowPadding};` : ''}
            ${initialSettings.mobileLogoHeight ? `--mobile-logo-height: ${initialSettings.mobileLogoHeight}px;` : ''}
            ${initialSettings.mobileLogoSubSize ? `--mobile-logo-sub-size: ${initialSettings.mobileLogoSubSize}px;` : ''}
            ${initialSettings.mobileSocialSize ? `--mobile-social-size: ${initialSettings.mobileSocialSize}px;` : ''}
            ${initialSettings.mobileSearchWidth ? `--mobile-search-width: ${initialSettings.mobileSearchWidth}px;` : ''}
            ${initialSettings.mobileSearchHeight ? `--mobile-search-height: ${initialSettings.mobileSearchHeight}px;` : ''}
            ${initialSettings.mobileBannerHeight ? `--mobile-banner-height: ${initialSettings.mobileBannerHeight}px;` : ''}
            ${initialSettings.mobileBannerBorderRadius ? `--mobile-banner-radius: ${initialSettings.mobileBannerBorderRadius}px;` : ''}
            ${initialSettings.mobileBranchColumns ? `--mobile-branch-columns: ${initialSettings.mobileBranchColumns};` : ''}
            ${initialSettings.mobileBranchGap ? `--mobile-branch-gap: ${initialSettings.mobileBranchGap}px;` : ''}
            ${initialSettings.mobileBranchBorderRadius ? `--mobile-branch-radius: ${initialSettings.mobileBranchBorderRadius}px;` : ''}
            ${initialSettings.mobileActionColumns ? `--mobile-action-columns: ${initialSettings.mobileActionColumns};` : ''}
            ${initialSettings.mobileActionGap ? `--mobile-action-gap: ${initialSettings.mobileActionGap}px;` : ''}
            ${initialSettings.mobileActionHeight ? `--mobile-action-height: ${initialSettings.mobileActionHeight}px;` : ''}
            ${initialSettings.mobileActionFontSize ? `--mobile-action-font-size: ${initialSettings.mobileActionFontSize}px;` : ''}
            ${initialSettings.mobileActionBorderRadius ? `--mobile-action-radius: ${initialSettings.mobileActionBorderRadius}px;` : ''}
            ${initialSettings.mobileListingGap ? `--mobile-listing-gap: ${initialSettings.mobileListingGap}px;` : ''}
          }
        `}} />
        
        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgJsonLd) }}
        />

        {/* Google Analytics */}
        {initialSettings.googleAnalyticsId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${initialSettings.googleAnalyticsId}`} />
            <script dangerouslySetInnerHTML={{ __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${initialSettings.googleAnalyticsId}');
            `}} />
          </>
        )}

        {/* Google Tag Manager */}
        {initialSettings.googleTagManagerId && (
          <script dangerouslySetInnerHTML={{ __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${initialSettings.googleTagManagerId}');
          `}} />
        )}

        {/* Facebook Pixel */}
        {initialSettings.facebookPixelId && (
          <script dangerouslySetInnerHTML={{ __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${initialSettings.facebookPixelId}');
            fbq('track', 'PageView');
          `}} />
        )}

        {/* Critical CSS for instant load */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --color-primary: ${initialSettings.primaryColor};
            --color-accent: ${initialSettings.accentColor};
            --color-bg: ${initialSettings.backgroundColor};
            --color-text: ${initialSettings.textColor};
          }
        `}} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Google Tag Manager (noscript) */}
        {initialSettings.googleTagManagerId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${initialSettings.googleTagManagerId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        
        <SettingsProvider initialSettings={initialSettings}>
          <CorporateHeader />
          {children}
          <CorporateFooter />
        </SettingsProvider>
      </body>
    </html>
  );
}
