import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ExperienceStoreDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  image?: string;
}

export class ExperienceUpdateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  status?: number;
}
