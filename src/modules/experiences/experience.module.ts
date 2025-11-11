import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Experience } from "./entity/experience.entity";
import { CityExperience } from "./entity/city-experience.entity";
import { ExperienceSeederService } from "./seeder/experience.seeder";
import { ExperienceController } from "./experience.controller";
import { ExperienceService } from "./experience.service";

@Module({
  imports: [TypeOrmModule.forFeature([Experience, CityExperience])],
  controllers: [ExperienceController],
  providers: [ExperienceService, ExperienceSeederService],
  exports: [ExperienceSeederService],
})
export class ExperienceModule { }
