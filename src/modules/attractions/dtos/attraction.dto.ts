import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { AttractionCategory } from 'src/common/enums/attraction.enum';

export class CreateAttractionDto {
  @Type(() => Number) // ✅ Convert string to number automatically
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
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  longitude?: number;
}

export class UpdateAttractionDto extends CreateAttractionDto {}
