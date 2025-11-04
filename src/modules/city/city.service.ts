import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Repository } from "typeorm";
import { City } from "./entity/city.entity";
import { CityStoreDto, CityUpdateDto } from "./dtos/city.dto";

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) { }

  /**
   * Centralized error handler
   */
  private handleError(error: any): never {
    console.error("CityService Error:", error);
    if (error instanceof BadRequestException || error instanceof NotFoundException) {
      throw error;
    }
    throw new InternalServerErrorException(
      error.message || "Something went wrong while processing your request.",
    );
  }

  /**
   * Create a new city
   */
  async createCity(body: CityStoreDto, created_by: number): Promise<City> {
    try {
      if (!body.name?.trim()) throw new BadRequestException("City name is required");
      if (!created_by) throw new BadRequestException("created_by is required");

      const city = this.cityRepository.create({
        name: body.name.trim(),
        description: body.description?.trim(),
        image: body.image,
        created_by,
      } as DeepPartial<City>);

      return await this.cityRepository.save(city);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Fetch all cities
   */
  async getAllCities(): Promise<City[]> {
    try {
      return await this.cityRepository.find({
        order: { id: "DESC" },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Fetch a single city by ID
   */
  async getCityById(id: number): Promise<City> {
    try {
      if (!id) throw new BadRequestException("City ID is required");

      const city = await this.cityRepository.findOne({ where: { id } });
      if (!city) throw new NotFoundException(`City with ID ${id} not found`);

      return city;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Update a city
   */
  async updateCity(id: number, body: CityUpdateDto): Promise<City> {
    try {
      if (!id) throw new BadRequestException("City ID is required");
      if (!body.name?.trim()) throw new BadRequestException("City name is required");

      const city = await this.cityRepository.findOne({ where: { id } });
      if (!city) throw new NotFoundException(`City with ID ${id} not found`);

      city.name = body.name.trim();
      city.description = body.description?.trim() || city.description;
      city.image = body.image || city.image;

      return await this.cityRepository.save(city);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Delete a city
   */
  async deleteCity(id: number): Promise<void> {
    try {
      if (!id) throw new BadRequestException("City ID is required");

      const city = await this.cityRepository.findOne({ where: { id } });
      if (!city) throw new NotFoundException(`City with ID ${id} not found`);

      await this.cityRepository.remove(city);
    } catch (error) {
      this.handleError(error);
    }
  }
}
