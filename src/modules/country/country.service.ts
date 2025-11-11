import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Country } from "./entity/country.entity";
import { CountryStoreDto, CountryUpdateDto } from "./dtos/country.dto";

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
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

  async createExperience(body: CountryStoreDto): Promise<Country> {
    try {
      if (!body.name?.trim()) throw new BadRequestException("Experience name is required");

      const experience = this.countryRepository.create({
        name: body.name.trim(),
        image: body.image,
      });

      return await this.countryRepository.save(experience);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAllExperiences(): Promise<Country[]> {
    try {
      return await this.countryRepository.find({
        order: { id: "DESC" },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async getExperienceById(id: number): Promise<Country> {
    try {
      if (!id) throw new BadRequestException("Experience ID is required");

      const experience = await this.countryRepository.findOne({ where: { id } });
      if (!experience) throw new NotFoundException(`Experience with ID ${id} not found`);

      return experience;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateExperience(id: number, body: CountryUpdateDto): Promise<Country> {
    try {
      if (!id) throw new BadRequestException("Experience ID is required");

      const experience = await this.countryRepository.findOne({ where: { id } });
      if (!experience) throw new NotFoundException(`Experience with ID ${id} not found`);

      experience.name = body.name?.trim() || experience.name;
      experience.image = body.image || experience.image;
      experience.status = body.status ?? experience.status;

      return await this.countryRepository.save(experience);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteExperience(id: number): Promise<void> {
    try {
      if (!id) throw new BadRequestException("Experience ID is required");

      const experience = await this.countryRepository.findOne({ where: { id } });
      if (!experience) throw new NotFoundException(`Experience with ID ${id} not found`);

      await this.countryRepository.remove(experience);
    } catch (error) {
      this.handleError(error);
    }
  }
}
