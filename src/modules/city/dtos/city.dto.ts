import { IsNotEmpty, IsOptional, IsArray, ArrayNotEmpty, IsInt } from "class-validator";
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
}
