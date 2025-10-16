import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { City } from "./entity/city.entity";

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  // Common error handling function
  private handleError(error: any) {
    console.error('CityService Error:', error);
    throw new InternalServerErrorException(error.message || 'Something went wrong');
  }

  // Create
  async createCity(name: string, created_by: number) {
    try {
      if (!name || name.trim() === '') {
        throw new BadRequestException('City name is required');
      }
      if (!created_by) {
        throw new BadRequestException('Created_by is required');
      }

      const city = this.cityRepository.create({ name: name.trim(), created_by });
      const savedCity = await this.cityRepository.save(city);

      return {
        success: true,
        message: 'City created successfully',
        data: [savedCity],
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Find all
  async getAllCities() {
    try {
      const cities = await this.cityRepository.find({ relations: ['admin'] });
      return {
        success: true,
        message: 'Cities fetched successfully',
        data: cities,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Find one
  async getCityById(id: number) {
    try {
      if (!id) throw new BadRequestException('City ID is required');

      const city = await this.cityRepository.findOne({ where: { id }, relations: ['admin'] });
      if (!city) throw new NotFoundException(`City with ID ${id} not found`);

      return {
        success: true,
        message: 'City fetched successfully',
        data: [city],
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Update
  async updateCity(id: number, name: string) {
    try {
      if (!id) throw new BadRequestException('City ID is required');
      if (!name || name.trim() === '') throw new BadRequestException('City name is required');

      const city = await this.cityRepository.findOne({ where: { id } });
      if (!city) throw new NotFoundException(`City with ID ${id} not found`);

      city.name = name.trim();
      city.updated_at = new Date().toISOString().split('T')[0];

      const updatedCity = await this.cityRepository.save(city);

      return {
        success: true,
        message: 'City updated successfully',
        data: [updatedCity],
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Delete
  async deleteCity(id: number) {
    try {
      if (!id) throw new BadRequestException('City ID is required');

      const city = await this.cityRepository.findOne({ where: { id } });
      if (!city) throw new NotFoundException(`City with ID ${id} not found`);

      await this.cityRepository.remove(city);

      return {
        success: true,
        message: `City with ID ${id} deleted successfully`,
        data: [],
      };
    } catch (error) {
      this.handleError(error);
    }
  }
}
