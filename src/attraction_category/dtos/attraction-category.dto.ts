import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AttractionCategoryStoreDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  image?: string;
}

export class AttractionCategoryUpdateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  image?: string;

  @IsOptional()
  status?: number;
}
