import { IsNotEmpty, IsOptional, IsArray, ArrayNotEmpty, IsInt, IsNumber } from "class-validator";
import { Type } from "class-transformer";

export class CityStoreDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description: string;

  @IsOptional()
  image: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  experience_ids?: number[];

  @IsNotEmpty()
  // @IsNumber()
  country_id: number; 
}

export class CityUpdateDto {
  @IsOptional()
  name: string;

  @IsOptional()
  description: string;

  @IsOptional()
  image: string;

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  experience_ids?: number[];

  @IsNotEmpty()
  // @IsInt()
  country_id: number; 
}
