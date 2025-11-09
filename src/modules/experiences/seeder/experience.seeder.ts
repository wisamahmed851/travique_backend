import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Experience } from "../entity/experience.entity";

@Injectable()
export class ExperienceSeederService {
  private readonly logger = new Logger(ExperienceSeederService.name);

  constructor(
    @InjectRepository(Experience)
    private readonly experienceRepository: Repository<Experience>,
  ) {}

  async seed(): Promise<void> {
    const count = await this.experienceRepository.count();
    if (count > 0) {
      this.logger.log("Experiences already seeded, skipping...");
      return;
    }

    const experiences = [
      { name: "Nature", status: 1 },
      { name: "Culture", status: 1 },
      { name: "Adventure", status: 1 },
      { name: "Historical", status: 1 },
      { name: "Luxury", status: 1 },
    ];

    const entities = this.experienceRepository.create(experiences);
    await this.experienceRepository.save(entities);

    this.logger.log("✅ Experience seeding completed successfully!");
  }
}
