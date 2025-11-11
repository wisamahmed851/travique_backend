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
import { ExperienceService } from "./experience.service";
import { AdminJwtAuthGuard } from "src/modules/auth/admin/admin-jwt.guard";
import { ExperienceStoreDto, ExperienceUpdateDto } from "./dtos/experience.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerConfig } from "src/common/utils/multer.config";

@Controller("admin/experience")
@UseGuards(AdminJwtAuthGuard)
export class ExperienceController {
    constructor(private readonly experienceService: ExperienceService) { }

    private formatResponse(success: boolean, message: string, data: any = []) {
        return { success, message, data };
    }

    @Post("store")
    @UseInterceptors(FileInterceptor("image", multerConfig("uploads")))
    async createExperience(
        @Body() body: ExperienceStoreDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const experience = await this.experienceService.createExperience({
            ...body,
            image: file?.filename,
        });
        return this.formatResponse(true, "Experience created successfully", [experience]);
    }

    @Get("list")
    async getAllExperiences() {
        const experiences = await this.experienceService.getAllExperiences();
        return this.formatResponse(true, "Experiences fetched successfully", experiences);
    }

    @Get("show/:id")
    async getExperienceById(@Param("id", ParseIntPipe) id: number) {
        const experience = await this.experienceService.getExperienceById(id);
        return this.formatResponse(true, "Experience fetched successfully", [experience]);
    }

    @Patch("update/:id")
    @UseInterceptors(FileInterceptor("image", multerConfig("uploads")))
    async updateExperience(
        @Param("id", ParseIntPipe) id: number,
        @Body() body: ExperienceUpdateDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        const updatedExperience = await this.experienceService.updateExperience(id, {
            ...body,
            image: file?.filename || body.image,
        });
        return this.formatResponse(true, "Experience updated successfully", [updatedExperience]);
    }

    @Delete("delete/:id")
    async deleteExperience(@Param("id", ParseIntPipe) id: number) {
        await this.experienceService.deleteExperience(id);
        return this.formatResponse(true, `Experience with ID ${id} deleted successfully`);
    }
}
