import {
    Injectable,
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AttractionCategory } from "./entity/attraction-category.entity";
import {
    AttractionCategoryStoreDto,
    AttractionCategoryUpdateDto,
} from "./dtos/attraction-category.dto";

@Injectable()
export class AttractionCategoryService {
    constructor(
        @InjectRepository(AttractionCategory)
        private readonly categoryRepository: Repository<AttractionCategory>,
    ) { }

    private handleError(error: any): never {
        console.error("AttractionCategoryService Error:", error);
        if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
        throw new InternalServerErrorException(
            error.message || "Something went wrong while processing your request.",
        );
    }

    async createCategory(body: AttractionCategoryStoreDto): Promise<AttractionCategory> {
        try {
            if (!body.name?.trim()) throw new BadRequestException("Category name is required");

            const category = this.categoryRepository.create({
                name: body.name.trim(),
                image: body.image,
            });

            return await this.categoryRepository.save(category);
        } catch (error) {
            this.handleError(error);
        }
    }

    async getAllCategories(): Promise<AttractionCategory[]> {
        try {
            const attractionCategory = await this.categoryRepository.find({
                order: { id: "DESC" },
            })
            return attractionCategory;
        } catch (error) {
            this.handleError(error);
        }
    }

    async getCategoryById(id: number): Promise<AttractionCategory> {
        try {
            const category = await this.categoryRepository.findOne({ where: { id } });
            if (!category) throw new NotFoundException(`Category with ID ${id} not found`);
            return category;
        } catch (error) {
            this.handleError(error);
        }
    }

    async updateCategory(id: number, body: AttractionCategoryUpdateDto): Promise<AttractionCategory> {
        try {
            const category = await this.categoryRepository.findOne({ where: { id } });
            if (!category) throw new NotFoundException(`Category with ID ${id} not found`);

            category.name = body.name?.trim() || category.name;
            category.image = body.image || category.image;
            category.status = body.status ?? category.status;

            return await this.categoryRepository.save(category);
        } catch (error) {
            this.handleError(error);
        }
    }

    async deleteCategory(id: number): Promise<void> {
        try {
            const category = await this.categoryRepository.findOne({ where: { id } });
            if (!category) throw new NotFoundException(`Category with ID ${id} not found`);

            await this.categoryRepository.remove(category);
        } catch (error) {
            this.handleError(error);
        }
    }
}
