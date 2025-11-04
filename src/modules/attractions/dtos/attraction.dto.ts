import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { AttractionCategory } from 'src/common/enums/attraction.enum';

export class CreateAttractionDto {
  @IsNumber()
  city_id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(AttractionCategory)
  category: AttractionCategory;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  contact_info?: string;

  @IsOptional()
  @IsString()
  opening_hours?: string;

  @IsOptional()
  @IsString()
  website_url?: string;

  @IsOptional()
  latitude?: number;

  @IsOptional()
  longitude?: number;
}

export class UpdateAttractionDto extends CreateAttractionDto {}
