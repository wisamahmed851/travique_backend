import { IsNotEmpty } from 'class-validator';

export class UserDetailsDto {

  @IsNotEmpty()
  identity_no: string;

  @IsNotEmpty()
  identity_validity_date: Date;

  @IsNotEmpty()
  identity_card_front_url: string;

  @IsNotEmpty()
  identity_card_back_url: string;
}
