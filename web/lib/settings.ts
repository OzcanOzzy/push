export type SiteSettings = {
  siteName?: string | null;
  logoUrl?: string | null;
  ownerName?: string | null;
  ownerTitle?: string | null;
  phoneNumber?: string | null;
  whatsappNumber?: string | null;
  email?: string | null;
  supportEmail?: string | null;
  primaryColor?: string | null;
  accentColor?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
};

export const defaultSettings: Required<SiteSettings> = {
  siteName: "Emlaknomi",
  logoUrl: "",
  ownerName: "Özcan Aktaş",
  ownerTitle: "Danışman",
  phoneNumber: "0543 306 14 99",
  whatsappNumber: "0543 306 14 99",
  email: "emlaknomiozcan@gmail.com",
  supportEmail: "destek@ozcanaktas.com",
  primaryColor: "#1a436e",
  accentColor: "#e20b0b",
  backgroundColor: "#e9e9f0",
  textColor: "#122033",
};
