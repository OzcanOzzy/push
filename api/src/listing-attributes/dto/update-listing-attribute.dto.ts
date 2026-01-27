import { PartialType } from '@nestjs/mapped-types';
import { CreateListingAttributeDto } from './create-listing-attribute.dto';

export class UpdateListingAttributeDto extends PartialType(CreateListingAttributeDto) {}
