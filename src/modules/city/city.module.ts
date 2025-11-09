import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { City } from "./entity/city.entity";
import { CityController } from "./city.controller";
import { CityService } from "./city.service";
import { Experience } from "../experiences/entity/experience.entity";
import { CityExperience } from "../experiences/entity/city-experience.entity";

@Module({
    imports: [TypeOrmModule.forFeature([City, Experience, CityExperience])],
    providers: [CityService],
    controllers: [CityController],
})
export class CityModule { }