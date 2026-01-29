import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SettingsProvider from "./components/SettingsProvider";
import CorporateHeader from "./components/CorporateHeader";
import CorporateFooter from "./components/CorporateFooter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Emlaknomi - Özcan Aktaş",
  description: "Emlak ilanları, şubeler ve danışman ağı.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
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
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SettingsProvider>
          <CorporateHeader />
          {children}
          <CorporateFooter />
        </SettingsProvider>
      </body>
    </html>
  );
}
