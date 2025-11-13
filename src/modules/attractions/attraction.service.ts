import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from 'src/modules/city/entity/city.entity';
import { Attraction } from './entity/attraction.entity';
import { AttractionImages } from './entity/attraction_images.entity';
import { CreateAttractionDto, UpdateAttractionDto } from './dtos/attraction.dto';
import { AttractionCategory } from 'src/attraction_category/entity/attraction-category.entity';

@Injectable()
export class AttractionService {
  constructor(
    @InjectRepository(Attraction)
    private readonly attractionRepo: Repository<Attraction>,

    @InjectRepository(AttractionImages)
    private readonly attractionImagesRepo: Repository<AttractionImages>,

    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,
    @InjectRepository(AttractionCategory)
    private readonly attractionCategoryRepo: Repository<AttractionCategory>,
  ) { }

  private handleError(error: any) {
    console.error('AttractionService Error:', error);
    if (error instanceof BadRequestException || error instanceof NotFoundException)
      throw error;
    throw new InternalServerErrorException('Something went wrong');
  }

  // ✅ Create
  async createAttraction(
    dto: CreateAttractionDto,
    main_image: string,
    galleryFiles?: Express.Multer.File[],
  ) {
    try {
      const city = await this.cityRepo.findOne({ where: { id: dto.city_id } });
      if (!city) throw new NotFoundException('City not found');
      const attractionCategory = await this.attractionCategoryRepo.findOne({ where: { id: dto.category_id } });
      if (!attractionCategory) throw new NotFoundException("Attraction Category Not Found");
      const attraction = this.attractionRepo.create({
        ...dto,
        main_image,
      });

      const savedAttraction = await this.attractionRepo.save(attraction);

      // Save multiple gallery images (if provided)
      if (galleryFiles?.length) {
        const imageEntities = galleryFiles.map((file) =>
          this.attractionImagesRepo.create({
            attraction: savedAttraction,
            attraction_id: savedAttraction.id,
            image_url: file.filename,
          }),
        );
        await this.attractionImagesRepo.save(imageEntities);
      }

      return savedAttraction;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ✅ Get all
  async getAllAttractions() {
    try {
      return await this.attractionRepo.find({
        relations: ['images', 'city'],
        order: { id: 'DESC' },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  // ✅ Get one
  async getAttractionById(id: number) {
    try {
      const attraction = await this.attractionRepo.findOne({
        where: { id },
        relations: ['images', 'city'],
      });
      if (!attraction) throw new NotFoundException('Attraction not found');
      return attraction;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ✅ Update
  async updateAttraction(
    id: number,
    dto: UpdateAttractionDto,
    main_image?: string,
    galleryFiles?: Express.Multer.File[],
  ) {
    try {
      const attraction = await this.attractionRepo.findOne({ where: { id } });
      if (!attraction) throw new NotFoundException('Attraction not found');
      const city = await this.cityRepo.findOne({ where: { id: dto.city_id } });
      if (!city) throw new NotFoundException('City not found');
      const attractionCategory = await this.attractionCategoryRepo.findOne({ where: { id: dto.category_id } });
      if (!attractionCategory) throw new NotFoundException("Attraction Category Not Found");
      Object.assign(attraction, dto);
      if (main_image) attraction.main_image = main_image;

      const updated = await this.attractionRepo.save(attraction);

      if (galleryFiles?.length) {
        // Replace all old images (optional: delete old ones)
        await this.attractionImagesRepo.delete({ attraction_id: id });
        const newImages = galleryFiles.map((file) =>
          this.attractionImagesRepo.create({
            attraction: attraction,
            attraction_id: id,
            image_url: file.filename,
          }),
        );
        await this.attractionImagesRepo.save(newImages);
      }

      return updated;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ✅ Delete
  async deleteAttraction(id: number) {
    try {
      const attraction = await this.attractionRepo.findOne({ where: { id } });
      if (!attraction) throw new NotFoundException('Attraction not found');
      await this.attractionRepo.remove(attraction);
    } catch (error) {
      this.handleError(error);
    }
  }
}
