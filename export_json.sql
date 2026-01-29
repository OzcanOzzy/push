-- SiteSetting
SELECT json_agg(t) FROM "SiteSetting" t;
-- SocialLink  
SELECT json_agg(t) FROM "SocialLink" t;
-- Banner
SELECT json_agg(t) FROM "Banner" t;
-- MenuItem
SELECT json_agg(t) FROM "MenuItem" t;
-- ActionButton
SELECT json_agg(t) FROM "ActionButton" t;
-- CityButton
SELECT json_agg(t) FROM "CityButton" t;
-- FooterItem
SELECT json_agg(t) FROM "FooterItem" t;
-- Branch
SELECT json_agg(t) FROM "Branch" t;
-- ListingLabel
SELECT json_agg(t) FROM "ListingLabel" t;
