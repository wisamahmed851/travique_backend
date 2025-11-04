import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Attraction } from "./entity/attraction.entity";
import { AttractionImages } from "./entity/attraction_images.entity";
import { City } from "../city/entity/city.entity";
import { AttractionService } from "./attraction.service";
import { AttractionController } from "./attraction.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Attraction, AttractionImages, City])],
    providers: [AttractionService],
    controllers: [AttractionController],
})
export class AttractionModule { }