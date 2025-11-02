import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BSON, DeepPartial, Repository } from "typeorm";
import { City } from "./entity/city.entity";
import { CityStoreDto } from "./dtos/city.dto";

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) { }

  // Common error handling function
  private handleError(error: any) {
    console.error('CityService Error:', error);
    throw new InternalServerErrorException(error.message || 'Something went wrong');
  }

  // Create
  async createCity(body: CityStoreDto, created_by: number) {
    try {
      if (!body.name?.trim()) throw new BadRequestException('City name is required');
      if (!created_by) throw new BadRequestException('Created_by is required');

      const city = this.cityRepository.create({
        name: body.name,
        description: body.description,
        image: body.image,
        created_by,
      } as DeepPartial<City>);

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
      const cities = await this.cityRepository.find();
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

      const city = await this.cityRepository.findOne({ where: { id } });
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
  async updateCity(id: number, body: CityStoreDto) {
    try {
      if (!id) throw new BadRequestException('City ID is required');
      if (!body.name || body.name.trim() === '') throw new BadRequestException('City name is required');

      const city = await this.cityRepository.findOne({ where: { id } });
      if (!city) throw new NotFoundException(`City with ID ${id} not found`);

      city.name = body.name.trim();
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
