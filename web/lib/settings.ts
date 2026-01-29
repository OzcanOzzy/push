export type SiteSettings = {
  siteName?: string | null;
  logoUrl?: string | null;
  ownerName?: string | null;
  ownerTitle?: string | null;
  showOwnerTitle?: boolean | null;
  phoneNumber?: string | null;
  whatsappNumber?: string | null;
  email?: string | null;
  supportEmail?: string | null;
  address?: string | null;
  primaryColor?: string | null;
  accentColor?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  // Hero/Banner customization
  heroBackgroundUrl?: string | null;
  heroOverlayColor?: string | null;
  heroOverlayOpacity?: number | null;
  bannerWidth?: number | null;
  bannerHeight?: number | null;
  bannerOpacity?: number | null;
  // Logo customization
  logoWidth?: number | null;
  logoHeight?: number | null;
  logoPositionX?: number | null;
  logoPositionY?: number | null;
  logoTagline?: string | null;
  logoTaglineFont?: string | null;
  logoTaglineFontSize?: number | null;
  logoTaglineColor?: string | null;
  // Logo subtitle (text under logo - separate from ownerName)
  logoSubtitleText?: string | null;
  logoSubtitleFont?: string | null;
  logoSubtitleFontSize?: number | null;
  logoSubtitleColor?: string | null;
  logoSubtitleBgColor?: string | null;
  showLogoSubtitle?: boolean | null;
  // Profile customization
  profileImageUrl?: string | null;
  profileImageWidth?: number | null;
  profileImageHeight?: number | null;
  profilePositionX?: number | null;
  profilePositionY?: number | null;
  profileOpacity?: number | null;
  profileTitleLabel?: string | null;
  profileTitleFont?: string | null;
  profileTitleSize?: number | null;
  profileTitleColor?: string | null;
  profileNameFont?: string | null;
  profileNameSize?: number | null;
  profileNameColor?: string | null;
  // Social links
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
  // Header customization
  headerBgColor?: string | null;
  headerBgGradient?: string | null;
  headerBgImage?: string | null;
  headerBgOpacity?: number | null;
  headerNavFont?: string | null;
  headerNavFontSize?: number | null;
  headerNavColor?: string | null;
  // Footer customization
  footerBgColor?: string | null;
  footerBgGradient?: string | null;
  footerBgImage?: string | null;
  footerBgOpacity?: number | null;
  footerTextColor?: string | null;
  footerFont?: string | null;
  footerFontSize?: number | null;
  // Main content background
  mainBgColor?: string | null;
  mainBgImage?: string | null;
  mainBgOpacity?: number | null;
  // Homepage city buttons customization
  homeCityBtnWidth?: number | null;
  homeCityBtnHeight?: number | null;
  homeCityBtnGap?: number | null;
  homeCityBtnBorderRadius?: number | null;
  homeCityBtnAlign?: string | null; // left, center, right
  // City button text customization
  cityBtnTitleColor?: string | null;
  cityBtnTitleSize?: number | null;
  cityBtnTitleFont?: string | null;
  cityBtnSubtitleColor?: string | null;
  cityBtnSubtitleSize?: number | null;
  // City button badge (Şube etiketi)
  cityBtnBadgeText?: string | null;
  cityBtnBadgeColor?: string | null;
  cityBtnBadgeBgColor?: string | null;
  cityBtnBadgeIcon?: string | null;
  cityBtnShowBadge?: boolean | null;
  // Homepage action buttons customization
  homeActionBtnWidth?: number | null;
  homeActionBtnHeight?: number | null;
  homeActionBtnGap?: number | null;
  homeActionBtnBorderRadius?: number | null;
  homeActionBtnFontSize?: number | null;
  // Section titles customization
  sectionTitleColor?: string | null;
  sectionTitleFont?: string | null;
  sectionTitleSize?: number | null;
  // "Şube İlanları" title
  branchSectionTitle?: string | null;
  // "Son Yüklenen İlanlar" title
  recentListingsTitle?: string | null;
  // "Tüm İlanları Gör" button
  viewAllBtnText?: string | null;
  viewAllBtnBgColor?: string | null;
  viewAllBtnTextColor?: string | null;
  // Footer content
  footerLogoSubtitle?: string | null;
  footerAddress?: string | null;
  footerAddress2?: string | null;
  footerPhone?: string | null;
  footerPhone2?: string | null;
  footerEmail?: string | null;
  footerWorkingHours?: string | null;
  footerCopyright?: string | null;
  footerShowMap?: boolean | null;
  footerMapUrl?: string | null;
  // SEO Settings
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  ogImage?: string | null;
  ogType?: string | null;
  twitterHandle?: string | null;
  canonicalUrl?: string | null;
  // Analytics
  googleAnalyticsId?: string | null;
  googleTagManagerId?: string | null;
  facebookPixelId?: string | null;
  // Schema.org / JSON-LD
  schemaOrgType?: string | null; // RealEstateAgent, LocalBusiness, etc.
  schemaOrgName?: string | null;
  schemaOrgDescription?: string | null;
  schemaOrgAddress?: string | null;
  schemaOrgCity?: string | null;
  schemaOrgRegion?: string | null;
  schemaOrgPostalCode?: string | null;
  schemaOrgCountry?: string | null;
  schemaOrgTelephone?: string | null;
  schemaOrgPriceRange?: string | null;
  schemaOrgOpeningHours?: string | null;
  // Verification Codes
  googleSiteVerification?: string | null;
  bingSiteVerification?: string | null;
  yandexVerification?: string | null;
  // Mobile Settings
  mobileHeaderPadding?: string | null;
  mobileNavFontSize?: number | null;
  mobileLogoRowPadding?: string | null;
  mobileLogoHeight?: number | null;
  mobileLogoSubSize?: number | null;
  mobileLogoAlign?: string | null;
  mobileSocialSize?: number | null;
  mobileSocialShow?: boolean | null;
  mobileSearchWidth?: number | null;
  mobileSearchHeight?: number | null;
  mobileSearchShow?: boolean | null;
  mobileBannerHeight?: number | null;
  mobileBannerAspectRatio?: string | null;
  mobileBannerFullWidth?: boolean | null;
  mobileBannerBorderRadius?: number | null;
  mobileBranchColumns?: number | null;
  mobileBranchGap?: number | null;
  mobileBranchSize?: number | null;
  mobileBranchBorderRadius?: number | null;
  mobileBranchAlign?: string | null;
  mobileActionColumns?: number | null;
  mobileActionGap?: number | null;
  mobileActionHeight?: number | null;
  mobileActionFontSize?: number | null;
  mobileActionBorderRadius?: number | null;
  mobileListingColumns?: number | null;
  mobileListingGap?: number | null;
  mobileSearchShow?: boolean | null;
};

export const defaultSettings: SiteSettings = {
  siteName: "Emlaknomi",
  logoUrl: "",
  ownerName: "Özcan Aktaş",
  ownerTitle: "Gayrimenkul Uzmanı",
  showOwnerTitle: false,
  phoneNumber: "0543 306 14 99",
  whatsappNumber: "0543 306 14 99",
  email: "emlaknomiozcan@gmail.com",
  supportEmail: "destek@ozcanaktas.com",
  primaryColor: "#1a436e",
  accentColor: "#e20b0b",
  backgroundColor: "#e9e9f0",
  textColor: "#122033",
  heroBackgroundUrl: "",
  heroOverlayColor: "#0c2340",
  heroOverlayOpacity: 0.7,
  bannerOpacity: 1,
  logoTagline: "Bizimle Güvendesiniz...",
  logoTaglineColor: "#fbbf24",
  // Logo subtitle settings (separate from owner info)
  logoSubtitleText: "",
  logoSubtitleFont: "inherit",
  logoSubtitleFontSize: 12,
  logoSubtitleColor: "#ffffff",
  logoSubtitleBgColor: "",
  showLogoSubtitle: true,
  // Profile settings
  profileTitleLabel: "GAYRİMENKUL UZMANI",
  profileTitleColor: "#d4af37",
  profileNameColor: "#d4af37",
  profileOpacity: 1,
  headerBgColor: "#0a4ea3",
  headerBgOpacity: 1,
  footerBgColor: "#0a4ea3",
  footerBgOpacity: 1,
  mainBgColor: "#ffffff",
  mainBgOpacity: 1,
};

export type MenuItem = {
  id: string;
  label: string;
  href: string;
  sortOrder: number;
  isActive: boolean;
  textColor?: string | null;
  bgColor?: string | null;
  icon?: string | null;
};
