import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BranchesModule } from './branches/branches.module';
import { CitiesModule } from './cities/cities.module';
import { ConsultantsModule } from './consultants/consultants.module';
import { DistrictsModule } from './districts/districts.module';
import { ListingsModule } from './listings/listings.module';
import { NeighborhoodsModule } from './neighborhoods/neighborhoods.module';
import { PrismaModule } from './prisma/prisma.module';
import { RequestsModule } from './requests/requests.module';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    BranchesModule,
    CitiesModule,
    ConsultantsModule,
    DistrictsModule,
    ListingsModule,
    NeighborhoodsModule,
    RequestsModule,
  ],
  providers: [RolesGuard],
})
export class AppModule {}
