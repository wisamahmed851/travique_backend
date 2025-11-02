import { IsNotEmpty, IsOptional } from "class-validator";

export class CityStoreDto{
    @IsNotEmpty()
    name: String;

    @IsOptional()
    description: String;

    @IsOptional()
    image: String;
}

export class CityUpdateDto{

    @IsOptional()
    name: String;

    @IsOptional()
    description: String;

    @IsOptional()
    image: String;
}