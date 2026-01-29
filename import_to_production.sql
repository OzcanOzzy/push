-- Production'a veri aktarma scripti
-- Önce mevcut verileri temizle
DELETE FROM "SocialLink";
DELETE FROM "CityButton";
DELETE FROM "ListingLabel";

-- SiteSetting güncelle (heroBackgroundUrl ve logoUrl'i production URL'ye değiştir)
UPDATE "SiteSetting" SET
  "siteName" = 'Emlaknomi',
  "logoUrl" = NULL,
  "ownerName" = 'Özcan AKTAŞ',
  "ownerTitle" = ' ',
  "phoneNumber" = '0543 306 14 99',
  "whatsappNumber" = '0533 638 7000',
  "email" = 'emlaknomiozcan@gmail.com',
  "supportEmail" = 'destek@ozcanaktas.com',
  "primaryColor" = '#1a436e',
  "accentColor" = '#e20b0b',
  "backgroundColor" = '#e9e9f0',
  "textColor" = '#122033',
  "facebookUrl" = 'www.facebook.com/ozcanaktasgayrimenkul',
  "heroBackgroundUrl" = NULL,
  "heroOverlayOpacity" = 1,
  "logoTagline" = '',
  "profileImageUrl" = '',
  "profileTitleLabel" = ' ',
  "bannerHeight" = 240,
  "footerBgColor" = '#0a4ea3',
  "footerBgGradient" = '#1e3a5f',
  "headerBgColor" = '#0a4ea3',
  "headerBgGradient" = '#1e3a5f',
  "headerBgImage" = '',
  "mainBgColor" = '#ededed',
  "mainBgImage" = '',
  "showOwnerTitle" = true,
  "bannerOpacity" = 1,
  "footerBgOpacity" = 1,
  "headerBgOpacity" = 1,
  "logoSubtitleBgColor" = '',
  "logoSubtitleColor" = '#e7dfd9',
  "logoSubtitleFont" = '''Inter'', sans-serif',
  "logoSubtitleFontSize" = 16,
  "logoSubtitleText" = 'Özcan AKTAŞ',
  "mainBgOpacity" = 1,
  "profileOpacity" = 1,
  "showLogoSubtitle" = true,
  "homeCityBtnBorderRadius" = 30,
  "homeCityBtnGap" = 50,
  "homeCityBtnHeight" = 200,
  "homeCityBtnWidth" = 200,
  "homeCityBtnAlign" = 'center',
  "cityBtnShowBadge" = true,
  "cityBtnTitleSize" = 22,
  "footerLogoSubtitle" = 'Bizimle Güvendesiniz...',
  "footerShowMap" = true,
  "viewAllBtnTextColor" = '#fcfcfc',
  "mobileBannerAspectRatio" = '2/1',
  "mobileBannerHeight" = 140,
  "mobileBranchColumns" = 3,
  "mobileBranchGap" = 8,
  "mobileHeaderPadding" = '10px 10px',
  "mobileListingColumns" = 1,
  "mobileLogoHeight" = 30,
  "mobileLogoSubSize" = 6,
  "mobileNavFontSize" = 11,
  "mobileSearchShow" = true,
  "mobileSocialShow" = true,
  "mobileSocialSize" = 13,
  "mobileActionBorderRadius" = 6,
  "mobileActionColumns" = 2,
  "mobileActionFontSize" = 10,
  "mobileActionGap" = 6,
  "mobileActionHeight" = 40,
  "mobileBannerBorderRadius" = 8,
  "mobileBannerFullWidth" = true,
  "mobileBranchAlign" = 'stretch',
  "mobileBranchBorderRadius" = 8,
  "mobileBranchSize" = 100,
  "mobileListingGap" = 8,
  "mobileLogoAlign" = 'center',
  "updatedAt" = NOW()
WHERE id = 'default';

-- SocialLink ekle
INSERT INTO "SocialLink" (id, label, url, icon, "sortOrder", "isActive", "createdAt", "updatedAt") VALUES
('cmkxvtbse00004cvb0j6dm6cw', 'Facebook', 'www.facebook.com/ozcanaktasgayrimenkul', 'fa-brands fa-facebook-f', 0, true, NOW(), NOW()),
('cmkxvu4h400014cvbvugif7in', 'İnstagram', 'www.instagram.com/ozcanaktasemlak', 'fa-brands fa-instagram', 1, true, NOW(), NOW()),
('cmkxvurv500024cvb20n3pa7s', 'E-mail', 'emlaknomiozcan@gmail.com', 'fa-solid fa-envelope', 2, true, NOW(), NOW()),
('cmkxvv6xl00034cvbbwx45bwk', 'Telefon', '0543 306 14 99', 'fa-solid fa-phone', 3, true, NOW(), NOW()),
('cmkxvzwhw00044cvbb0j1xt16', 'Whatsapp', 'https://wa.me/00905433061499', 'fa-brands fa-whatsapp', 4, true, NOW(), NOW());

-- ListingLabel ekle
INSERT INTO "ListingLabel" (id, name, slug, "textColor", "bgColor", "borderRadius", "isRounded", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES
('cmkyc4jbo000014vb61lxkmxh', 'Acil', 'acil', '#ffffff', '#06b6d4', 4, false, 0, true, NOW(), NOW());

-- İşlem tamamlandı mesajı
SELECT 'Veri aktarımı tamamlandı!' as status;
