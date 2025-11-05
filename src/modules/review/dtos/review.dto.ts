import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @IsOptional()
  user_id: number;

  @IsInt()
  @IsNotEmpty()
  attraction_id: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}

export class UpdateReviewDto {
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsInt()
  @IsOptional()
  likes?: number;
}
