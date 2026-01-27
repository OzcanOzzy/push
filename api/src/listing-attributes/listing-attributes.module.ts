import { Module } from '@nestjs/common';
import { ListingAttributesController } from './listing-attributes.controller';
import { ListingAttributesService } from './listing-attributes.service';

@Module({
  controllers: [ListingAttributesController],
  providers: [ListingAttributesService],
})
export class ListingAttributesModule {}
