import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Experience } from "./entity/experience.entity";
import { ExperienceStoreDto, ExperienceUpdateDto } from "./dtos/experience.dto";

@Injectable()
export class ExperienceService {
  constructor(
    @InjectRepository(Experience)
    private readonly experienceRepository: Repository<Experience>,
  ) {}

  private handleError(error: any): never {
    console.error("ExperienceService Error:", error);
    if (error instanceof BadRequestException || error instanceof NotFoundException) {
      throw error;
    }
    throw new InternalServerErrorException(
      error.message || "Something went wrong while processing your request.",
    );
  }

  async createExperience(body: ExperienceStoreDto): Promise<Experience> {
    try {
      if (!body.name?.trim()) throw new BadRequestException("Experience name is required");

      const experience = this.experienceRepository.create({
        name: body.name.trim(),
        image: body.image,
      });

      return await this.experienceRepository.save(experience);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAllExperiences(): Promise<Experience[]> {
    try {
      return await this.experienceRepository.find({
        order: { id: "DESC" },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async getExperienceById(id: number): Promise<Experience> {
    try {
      if (!id) throw new BadRequestException("Experience ID is required");

      const experience = await this.experienceRepository.findOne({ where: { id } });
      if (!experience) throw new NotFoundException(`Experience with ID ${id} not found`);

      return experience;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateExperience(id: number, body: ExperienceUpdateDto): Promise<Experience> {
    try {
      if (!id) throw new BadRequestException("Experience ID is required");

      const experience = await this.experienceRepository.findOne({ where: { id } });
      if (!experience) throw new NotFoundException(`Experience with ID ${id} not found`);

      experience.name = body.name?.trim() || experience.name;
      experience.image = body.image || experience.image;
      experience.status = body.status ?? experience.status;

      return await this.experienceRepository.save(experience);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteExperience(id: number): Promise<void> {
    try {
      if (!id) throw new BadRequestException("Experience ID is required");

      const experience = await this.experienceRepository.findOne({ where: { id } });
      if (!experience) throw new NotFoundException(`Experience with ID ${id} not found`);

      await this.experienceRepository.remove(experience);
    } catch (error) {
      this.handleError(error);
    }
  }
}
