import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Experience } from "./entity/experience.entity";
import { CityExperience } from "./entity/city-experience.entity";
import { ExperienceSeederService } from "./seeder/experience.seeder";

@Module({
  imports: [TypeOrmModule.forFeature([Experience, CityExperience])],
  providers: [ExperienceSeederService],
  exports: [ExperienceSeederService],
})
export class ExperienceModule {}
