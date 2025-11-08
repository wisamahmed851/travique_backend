import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateFavoriteDto {
  @IsInt()
  @IsNotEmpty()
  attraction_id: number;
}
