import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CountryStoreDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  image?: string;
}

export class CountryUpdateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  status?: number;
}
