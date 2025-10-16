import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { City } from "./entity/city.entity";
import { CityController } from "./city.controller";
import { CityService } from "./city.service";

@Module({
    imports: [TypeOrmModule.forFeature([City])],
    providers: [CityService],
    controllers: [CityController],
})
export class CityModule { }