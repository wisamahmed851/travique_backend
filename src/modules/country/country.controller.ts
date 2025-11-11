import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    Patch,
    Delete,
    ParseIntPipe,
    UseGuards,
    UseInterceptors,
    UploadedFile,
} from "@nestjs/common";
import { AdminJwtAuthGuard } from "src/modules/auth/admin/admin-jwt.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerConfig } from "src/common/utils/multer.config";
import { ExperienceStoreDto } from "../experiences/dtos/experience.dto";
import { CountryService } from "./country.service";
import { CountryUpdateDto } from "./dtos/country.dto";

@Controller("admin/experience")
// @UseGuards(AdminJwtAuthGuard)
export class CountryController {
    constructor(private readonly countryService: CountryService) { }

    private formatResponse(success: boolean, message: string, data: any = []) {
        return { success, message, data };
    }

    @Post("store")
    @UseInterceptors(FileInterceptor("image", multerConfig("uploads")))
    async createExperience(
        @Body() body: ExperienceStoreDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const experience = await this.countryService.createExperience({
            ...body,
            image: file?.filename,
        });
        return this.formatResponse(true, "Experience created successfully", [experience]);
    }

    @Get("list")
    async getAllExperiences() {
        const experiences = await this.countryService.getAllExperiences();
        return this.formatResponse(true, "Experiences fetched successfully", experiences);
    }

    @Get("show/:id")
    async getExperienceById(@Param("id", ParseIntPipe) id: number) {
        const experience = await this.countryService.getExperienceById(id);
        return this.formatResponse(true, "Experience fetched successfully", [experience]);
    }

    @Patch("update/:id")
    @UseInterceptors(FileInterceptor("image", multerConfig("uploads")))
    async updateExperience(
        @Param("id", ParseIntPipe) id: number,
        @Body() body: CountryUpdateDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        const updatedExperience = await this.countryService.updateExperience(id, {
            ...body,
            image: file?.filename || body.image,
        });
        return this.formatResponse(true, "Experience updated successfully", [updatedExperience]);
    }

    @Delete("delete/:id")
    async deleteExperience(@Param("id", ParseIntPipe) id: number) {
        await this.countryService.deleteExperience(id);
        return this.formatResponse(true, `Experience with ID ${id} deleted successfully`);
    }
}
