import { IsOptional, IsString, MaxLength, IsNumber, IsBoolean } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  siteName?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  ownerName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  ownerTitle?: string;

  @IsOptional()
  @IsBoolean()
  showOwnerTitle?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  whatsappNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  supportEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  primaryColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  accentColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  backgroundColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  textColor?: string;

  // Hero section customization
  @IsOptional()
  @IsString()
  heroBackgroundUrl?: string;

  @IsOptional()
  @IsString()
  heroOverlayColor?: string;

  @IsOptional()
  @IsNumber()
  heroOverlayOpacity?: number;

  // Banner customization
  @IsOptional()
  @IsNumber()
  bannerWidth?: number;

  @IsOptional()
  @IsNumber()
  bannerHeight?: number;

  @IsOptional()
  @IsNumber()
  bannerOpacity?: number;

  // Logo customization
  @IsOptional()
  @IsNumber()
  logoWidth?: number;

  @IsOptional()
  @IsNumber()
  logoHeight?: number;

  @IsOptional()
  @IsNumber()
  logoPositionX?: number;

  @IsOptional()
  @IsNumber()
  logoPositionY?: number;

  @IsOptional()
  @IsString()
  logoTagline?: string;

  @IsOptional()
  @IsString()
  logoTaglineFont?: string;

  @IsOptional()
  @IsNumber()
  logoTaglineFontSize?: number;

  @IsOptional()
  @IsString()
  logoTaglineColor?: string;

  // Logo subtitle (separate from owner info)
  @IsOptional()
  @IsString()
  logoSubtitleText?: string;

  @IsOptional()
  @IsString()
  logoSubtitleFont?: string;

  @IsOptional()
  @IsNumber()
  logoSubtitleFontSize?: number;

  @IsOptional()
  @IsString()
  logoSubtitleColor?: string;

  @IsOptional()
  @IsString()
  logoSubtitleBgColor?: string;

  @IsOptional()
  @IsBoolean()
  showLogoSubtitle?: boolean;

  // Profile section customization
  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  @IsOptional()
  @IsNumber()
  profileImageWidth?: number;

  @IsOptional()
  @IsNumber()
  profileImageHeight?: number;

  @IsOptional()
  @IsNumber()
  profilePositionX?: number;

  @IsOptional()
  @IsNumber()
  profilePositionY?: number;

  @IsOptional()
  @IsNumber()
  profileOpacity?: number;

  @IsOptional()
  @IsString()
  profileTitleLabel?: string;

  @IsOptional()
  @IsString()
  profileTitleFont?: string;

  @IsOptional()
  @IsNumber()
  profileTitleSize?: number;

  @IsOptional()
  @IsString()
  profileTitleColor?: string;

  @IsOptional()
  @IsString()
  profileNameFont?: string;

  @IsOptional()
  @IsNumber()
  profileNameSize?: number;

  @IsOptional()
  @IsString()
  profileNameColor?: string;

  // Social links
  @IsOptional()
  @IsString()
  instagramUrl?: string;

  @IsOptional()
  @IsString()
  facebookUrl?: string;

  @IsOptional()
  @IsString()
  youtubeUrl?: string;

  @IsOptional()
  @IsString()
  twitterUrl?: string;

  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  // Header customization
  @IsOptional()
  @IsString()
  headerBgColor?: string;

  @IsOptional()
  @IsString()
  headerBgGradient?: string;

  @IsOptional()
  @IsString()
  headerBgImage?: string;

  @IsOptional()
  @IsNumber()
  headerBgOpacity?: number;

  @IsOptional()
  @IsString()
  headerNavFont?: string;

  @IsOptional()
  @IsNumber()
  headerNavFontSize?: number;

  @IsOptional()
  @IsString()
  headerNavColor?: string;

  // Footer customization
  @IsOptional()
  @IsString()
  footerBgColor?: string;

  @IsOptional()
  @IsString()
  footerBgGradient?: string;

  @IsOptional()
  @IsString()
  footerBgImage?: string;

  @IsOptional()
  @IsNumber()
  footerBgOpacity?: number;

  @IsOptional()
  @IsString()
  footerTextColor?: string;

  @IsOptional()
  @IsString()
  footerFont?: string;

  @IsOptional()
  @IsNumber()
  footerFontSize?: number;

  // Main content background
  @IsOptional()
  @IsString()
  mainBgColor?: string;

  @IsOptional()
  @IsString()
  mainBgImage?: string;

  @IsOptional()
  @IsNumber()
  mainBgOpacity?: number;

  // Homepage city buttons customization
  @IsOptional()
  @IsNumber()
  homeCityBtnWidth?: number;

  @IsOptional()
  @IsNumber()
  homeCityBtnHeight?: number;

  @IsOptional()
  @IsNumber()
  homeCityBtnGap?: number;

  @IsOptional()
  @IsNumber()
  homeCityBtnBorderRadius?: number;

  @IsOptional()
  @IsString()
  homeCityBtnAlign?: string;

  // Homepage action buttons customization
  @IsOptional()
  @IsNumber()
  homeActionBtnWidth?: number;

  @IsOptional()
  @IsNumber()
  homeActionBtnHeight?: number;

  @IsOptional()
  @IsNumber()
  homeActionBtnGap?: number;

  @IsOptional()
  @IsNumber()
  homeActionBtnBorderRadius?: number;

  @IsOptional()
  @IsNumber()
  homeActionBtnFontSize?: number;

  // City button text customization
  @IsOptional()
  @IsString()
  cityBtnTitleColor?: string;

  @IsOptional()
  @IsNumber()
  cityBtnTitleSize?: number;

  @IsOptional()
  @IsString()
  cityBtnTitleFont?: string;

  @IsOptional()
  @IsString()
  cityBtnSubtitleColor?: string;

  @IsOptional()
  @IsNumber()
  cityBtnSubtitleSize?: number;

  // City button badge
  @IsOptional()
  @IsString()
  cityBtnBadgeText?: string;

  @IsOptional()
  @IsString()
  cityBtnBadgeColor?: string;

  @IsOptional()
  @IsString()
  cityBtnBadgeBgColor?: string;

  @IsOptional()
  @IsString()
  cityBtnBadgeIcon?: string;

  @IsOptional()
  @IsBoolean()
  cityBtnShowBadge?: boolean;

  // Section titles
  @IsOptional()
  @IsString()
  sectionTitleColor?: string;

  @IsOptional()
  @IsString()
  sectionTitleFont?: string;

  @IsOptional()
  @IsNumber()
  sectionTitleSize?: number;

  @IsOptional()
  @IsString()
  branchSectionTitle?: string;

  @IsOptional()
  @IsString()
  recentListingsTitle?: string;

  // View all button
  @IsOptional()
  @IsString()
  viewAllBtnText?: string;

  @IsOptional()
  @IsString()
  viewAllBtnBgColor?: string;

  @IsOptional()
  @IsString()
  viewAllBtnTextColor?: string;

  // Footer content
  @IsOptional()
  @IsString()
  footerLogoSubtitle?: string;

  @IsOptional()
  @IsString()
  footerAddress?: string;

  @IsOptional()
  @IsString()
  footerAddress2?: string;

  @IsOptional()
  @IsString()
  footerPhone?: string;

  @IsOptional()
  @IsString()
  footerPhone2?: string;

  @IsOptional()
  @IsString()
  footerEmail?: string;

  @IsOptional()
  @IsString()
  footerWorkingHours?: string;

  @IsOptional()
  @IsString()
  footerCopyright?: string;

  @IsOptional()
  @IsBoolean()
  footerShowMap?: boolean;

  @IsOptional()
  @IsString()
  footerMapUrl?: string;

  // SEO Settings
  @IsOptional()
  @IsString()
  @MaxLength(70)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(170)
  metaDescription?: string;

  @IsOptional()
  @IsString()
  metaKeywords?: string;

  @IsOptional()
  @IsString()
  ogImage?: string;

  @IsOptional()
  @IsString()
  ogType?: string;

  @IsOptional()
  @IsString()
  twitterHandle?: string;

  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  // Analytics
  @IsOptional()
  @IsString()
  googleAnalyticsId?: string;

  @IsOptional()
  @IsString()
  googleTagManagerId?: string;

  @IsOptional()
  @IsString()
  facebookPixelId?: string;

  // Schema.org
  @IsOptional()
  @IsString()
  schemaOrgType?: string;

  @IsOptional()
  @IsString()
  schemaOrgName?: string;

  @IsOptional()
  @IsString()
  schemaOrgDescription?: string;

  @IsOptional()
  @IsString()
  schemaOrgAddress?: string;

  @IsOptional()
  @IsString()
  schemaOrgCity?: string;

  @IsOptional()
  @IsString()
  schemaOrgRegion?: string;

  @IsOptional()
  @IsString()
  schemaOrgPostalCode?: string;

  @IsOptional()
  @IsString()
  schemaOrgCountry?: string;

  @IsOptional()
  @IsString()
  schemaOrgTelephone?: string;

  @IsOptional()
  @IsString()
  schemaOrgPriceRange?: string;

  @IsOptional()
  @IsString()
  schemaOrgOpeningHours?: string;

  // Verification
  @IsOptional()
  @IsString()
  googleSiteVerification?: string;

  @IsOptional()
  @IsString()
  bingSiteVerification?: string;

  @IsOptional()
  @IsString()
  yandexVerification?: string;

  // Mobile Settings
  @IsOptional()
  @IsString()
  mobileHeaderPadding?: string;

  @IsOptional()
  @IsNumber()
  mobileNavFontSize?: number;

  @IsOptional()
  @IsString()
  mobileLogoRowPadding?: string;

  @IsOptional()
  @IsNumber()
  mobileLogoHeight?: number;

  @IsOptional()
  @IsNumber()
  mobileLogoSubSize?: number;

  @IsOptional()
  @IsString()
  mobileLogoAlign?: string;

  @IsOptional()
  @IsNumber()
  mobileSocialSize?: number;

  @IsOptional()
  @IsBoolean()
  mobileSocialShow?: boolean;

  @IsOptional()
  @IsNumber()
  mobileSearchWidth?: number;

  @IsOptional()
  @IsNumber()
  mobileSearchHeight?: number;

  @IsOptional()
  @IsBoolean()
  mobileSearchShow?: boolean;

  @IsOptional()
  @IsNumber()
  mobileBannerHeight?: number;

  @IsOptional()
  @IsString()
  mobileBannerAspectRatio?: string;

  @IsOptional()
  @IsBoolean()
  mobileBannerFullWidth?: boolean;

  @IsOptional()
  @IsNumber()
  mobileBannerBorderRadius?: number;

  @IsOptional()
  @IsNumber()
  mobileBranchColumns?: number;

  @IsOptional()
  @IsNumber()
  mobileBranchGap?: number;

  @IsOptional()
  @IsNumber()
  mobileBranchSize?: number;

  @IsOptional()
  @IsNumber()
  mobileBranchBorderRadius?: number;

  @IsOptional()
  @IsString()
  mobileBranchAlign?: string;

  @IsOptional()
  @IsNumber()
  mobileActionColumns?: number;

  @IsOptional()
  @IsNumber()
  mobileActionGap?: number;

  @IsOptional()
  @IsNumber()
  mobileActionHeight?: number;

  @IsOptional()
  @IsNumber()
  mobileActionFontSize?: number;

  @IsOptional()
  @IsNumber()
  mobileActionBorderRadius?: number;

  @IsOptional()
  @IsNumber()
  mobileListingColumns?: number;

  @IsOptional()
  @IsNumber()
  mobileListingGap?: number;

  @IsOptional()
  @IsBoolean()
  mobileSearchShow?: boolean;
}
