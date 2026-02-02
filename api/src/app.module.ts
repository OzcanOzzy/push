import { Module } from '@nestjs/common';
import { ActionButtonsModule } from './action-buttons/action-buttons.module';
import { AuthModule } from './auth/auth.module';
import { BackupModule } from './backup/backup.module';
import { BannersModule } from './banners/banners.module';
import { BlogModule } from './blog/blog.module';
import { BranchesModule } from './branches/branches.module';
import { CitiesModule } from './cities/cities.module';
import { CityButtonsModule } from './city-buttons/city-buttons.module';
import { ConsultantsModule } from './consultants/consultants.module';
import { DistrictsModule } from './districts/districts.module';
import { FooterItemsModule } from './footer-items/footer-items.module';
import { ListingsModule } from './listings/listings.module';
import { ListingAttributesModule } from './listing-attributes/listing-attributes.module';
import { ListingLabelsModule } from './listing-labels/listing-labels.module';
import { MenuItemsModule } from './menu-items/menu-items.module';
import { NeighborhoodsModule } from './neighborhoods/neighborhoods.module';
import { PageDesignModule } from './page-design/page-design.module';
import { PagesModule } from './pages/pages.module';
import { PrismaModule } from './prisma/prisma.module';
import { PropertyRequestsModule } from './property-requests/property-requests.module';
import { RequestsModule } from './requests/requests.module';
import { RolesGuard } from './auth/guards/roles.guard';
import { SettingsModule } from './settings/settings.module';
import { SocialLinksModule } from './social-links/social-links.module';
import { UsersModule } from './users/users.module';
import { UtilsModule } from './utils/utils.module';
import { ValuationRequestsModule } from './valuation-requests/valuation-requests.module';

@Module({
  imports: [
    PrismaModule,
    ActionButtonsModule,
    AuthModule,
    BackupModule,
    BannersModule,
    BlogModule,
    BranchesModule,
    CitiesModule,
    CityButtonsModule,
    ConsultantsModule,
    DistrictsModule,
    FooterItemsModule,
    ListingsModule,
    ListingAttributesModule,
    ListingLabelsModule,
    MenuItemsModule,
    NeighborhoodsModule,
    PageDesignModule,
    PagesModule,
    PropertyRequestsModule,
    RequestsModule,
    SettingsModule,
    SocialLinksModule,
    UsersModule,
    UtilsModule,
    ValuationRequestsModule,
  ],
  providers: [RolesGuard],
})
export class AppModule {}
