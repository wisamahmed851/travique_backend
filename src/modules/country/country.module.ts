import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CountrySeederService } from "./seeder/country.seeder";
import { CountryController } from "./country.controller";
import { CountryService } from "./country.service";
import { Country } from "./entity/country.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Country])],
  controllers: [CountryController],
  providers: [CountryService, CountrySeederService],
  exports: [CountrySeederService],
})
export class CountryModule { }
