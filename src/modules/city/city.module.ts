import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { City } from "./entity/city.entity";
import { CityController } from "./city.controller";
import { CityService } from "./city.service";
import { Experience } from "../experiences/entity/experience.entity";
import { CityExperience } from "../experiences/entity/city-experience.entity";
import { CityUserController } from "./city-user.controller";
import { Attraction } from "../attractions/entity/attraction.entity";
import { Country } from "../country/entity/country.entity";

@Module({
    imports: [TypeOrmModule.forFeature([City, Experience, CityExperience, Attraction, Country])],
    providers: [CityService],
    controllers: [CityController, CityUserController],
})
export class CityModule { }