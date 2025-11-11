import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Country } from "../entity/country.entity";

@Injectable()
export class CountrySeederService {
  private readonly logger = new Logger(CountrySeederService.name);

  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) { }

  async seed(): Promise<void> {
    const count = await this.countryRepository.count();
    if (count > 0) {
      this.logger.log("Country already seeded, skipping...");
      return;
    }

    const experiences = [
      { name: "USA", status: 1 },
      { name: "France", status: 1 },
      { name: "Japan", status: 1 },
      { name: "Australia", status: 1 },
    ];

    const entities = this.countryRepository.create(experiences);
    await this.countryRepository.save(entities);

    this.logger.log("✅ Experience seeding completed successfully!");
  }
}
