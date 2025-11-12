import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { City } from './entity/city.entity';
import { CityStoreDto, CityUpdateDto } from './dtos/city.dto';
import { CityExperience } from '../experiences/entity/city-experience.entity';
import { Experience } from '../experiences/entity/experience.entity';
import { Attraction } from '../attractions/entity/attraction.entity';
import { Country } from '../country/entity/country.entity';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,

    @InjectRepository(CityExperience)
    private readonly cityExperienceRepository: Repository<CityExperience>,

    @InjectRepository(Experience)
    private readonly experienceRepository: Repository<Experience>,

    @InjectRepository(Attraction)
    private readonly attractionRepository: Repository<Attraction>,

    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {}

  /**
   * Centralized error handler
   */
  private handleError(error: any): never {
    console.error('CityService Error:', error);
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException
    ) {
      throw error;
    }
    throw new InternalServerErrorException(
      error.message || 'Something went wrong while processing your request.',
    );
  }

  /**
   * Create a new city with multiple experiences
   */
  async createCity(body: CityStoreDto, created_by: number): Promise<City> {
    try {
      if (!body.name?.trim())
        throw new BadRequestException('City name is required');
      if (!created_by) throw new BadRequestException('created_by is required');
      if (!body.country_id)
        throw new BadRequestException('Country ID is required');

      // Step 1: Fetch the country by ID
      const country = await this.cityRepository.manager
        .getRepository(Country)
        .findOne({ where: { id: body.country_id } });
      if (!country) throw new NotFoundException('Country not found');

      // Step 2: Create city entity
      const city = this.cityRepository.create({
        name: body.name.trim(),
        description: body.description?.trim(),
        image: body.image,
        created_by,
        country, // Set the country relationship
      } as DeepPartial<City>);

      // Step 3: Save the city first to get ID
      const savedCity = await this.cityRepository.save(city);

      // Step 4: Handle experiences (if provided)
      if (body.experience_ids && body.experience_ids.length > 0) {
        const experiences = await this.experienceRepository.findByIds(
          body.experience_ids,
        );

        if (experiences.length === 0)
          throw new NotFoundException('No valid experiences found');

        const cityExperienceLinks = experiences.map((exp) =>
          this.cityExperienceRepository.create({
            city: savedCity,
            experience: exp,
          }),
        );

        await this.cityExperienceRepository.save(cityExperienceLinks);
      }

      // Return the saved city with related experiences
      const newCity = await this.cityRepository.findOne({
        where: { id: savedCity.id },
        relations: ['cityExperiences', 'cityExperiences.experience', 'country'],
      });

      if (!newCity) throw new NotFoundException('Something went wrong');

      return newCity;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get all cities (with optional search & experience filters)
   * + include attraction count
   */
  async getAllCities(search?: string, experienceId?: number): Promise<any[]> {
    try {
      const qb = this.cityRepository
        .createQueryBuilder('city')
        .leftJoinAndSelect('city.cityExperiences', 'cityExperience')
        .leftJoinAndSelect('cityExperience.experience', 'experience')
        .leftJoinAndSelect("city.country", 'country')
        .loadRelationCountAndMap('city.attractionCount', 'city.attractions') // count attractions
        .orderBy('city.id', 'DESC');

      // Optional filters
      if (search) {
        qb.andWhere('LOWER(city.name) LIKE :search', {
          search: `%${search.toLowerCase()}%`,
        });
      }

      if (experienceId) {
        qb.andWhere('experience.id = :experienceId', { experienceId });
      }

      return await qb.getMany();
    } catch (error) {
      this.handleError(error);
    }
  }

  async gethome() {
    const popularcities = await this.cityRepository.find({
      order: { id: 'ASC' },
      take: 4,
      select: ['id', 'name', 'description', 'image'],
    });
    const experience = await this.experienceRepository.find({
      order: {
        id: 'ASC',
      },
      take: 4,
      select: ['id', 'name', 'image'],
    });
    if (popularcities.length < 0)
      throw new NotFoundException('THere is not any cites in the list');
    return { popular_cities: popularcities, experience: experience };
  }

  /**
   * Fetch a single city by ID (with experiences & attraction count)
   */
  async getCityById(id: number): Promise<City> {
    try {
      if (!id) throw new BadRequestException('City ID is required');

      const city = await this.cityRepository
        .createQueryBuilder('city')
        .leftJoinAndSelect('city.cityExperiences', 'cityExperience')
        .leftJoinAndSelect('cityExperience.experience', 'experience')
        .leftJoinAndSelect('city.attractions', 'attractions')
        .leftJoinAndSelect('city.country', 'country')
        .where('city.id = :id', { id })
        .getOne();

      if (!city) throw new NotFoundException(`City with ID ${id} not found`);

      return city;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Update city details and (optionally) experiences
   */
  async updateCity(id: number, body: CityUpdateDto): Promise<City> {
    try {
      if (!id) throw new BadRequestException('City ID is required');

      const city = await this.cityRepository.findOne({
        where: { id },
        relations: ['country'],
      });
      if (!city) throw new NotFoundException(`City with ID ${id} not found`);

      // Update city fields
      city.name = body.name?.trim() || city.name;
      city.description = body.description?.trim() || city.description;
      city.image = body.image || city.image;

      // If country_id is provided, update the country
      if (body.country_id) {
        const country = await this.cityRepository.manager
          .getRepository(Country)
          .findOne({ where: { id: body.country_id } });
        if (!country) throw new NotFoundException('Country not found');

        city.country = country; // Set the new country relationship
      }

      await this.cityRepository.save(city);

      // Update experiences if provided
      if (body.experience_ids) {
        // Remove old links
        await this.cityExperienceRepository.delete({ city: { id } });

        const experiences = await this.experienceRepository.findByIds(
          body.experience_ids,
        );
        if (experiences.length > 0) {
          const newLinks = experiences.map((exp) =>
            this.cityExperienceRepository.create({ city, experience: exp }),
          );
          await this.cityExperienceRepository.save(newLinks);
        }
      }

      return await this.getCityById(city.id);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Delete a city
   */
  async deleteCity(id: number): Promise<void> {
    try {
      if (!id) throw new BadRequestException('City ID is required');

      const city = await this.cityRepository.findOne({ where: { id } });
      if (!city) throw new NotFoundException(`City with ID ${id} not found`);

      await this.cityRepository.remove(city);
    } catch (error) {
      this.handleError(error);
    }
  }
}
