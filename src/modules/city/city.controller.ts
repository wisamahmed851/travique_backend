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
  Query,
} from "@nestjs/common";
import { CityService } from "./city.service";
import { AdminJwtAuthGuard } from "src/modules/auth/admin/admin-jwt.guard";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { CityStoreDto, CityUpdateDto } from "./dtos/city.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerConfig } from "src/common/utils/multer.config";

@Controller("admin/city")
@UseGuards(AdminJwtAuthGuard)
export class CityController {
  constructor(private readonly cityService: CityService) { }

  private formatResponse(success: boolean, message: string, data: any = []) {
    return { success, message, data };
  }

  /**
   * Create a new city with multiple experiences
   */
  @Post("store")
  @UseInterceptors(FileInterceptor("image", multerConfig("uploads")))
  async createCity(
    @Body() city: CityStoreDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser("id") created_by: number,
  ) {
    const savedCity = await this.cityService.createCity(
      { ...city, image: file?.filename },
      created_by,
    );
    return this.formatResponse(true, "City created successfully", [savedCity]);
  }

  /**
   * Get all cities — supports filters and search
   */
  @Get("list")
  async getAllCities(
    @Query("search") search?: string,
    @Query("experienceId") experienceId?: number,
  ) {
    const cities = await this.cityService.getAllCities(search, experienceId);
    return this.formatResponse(true, "Cities fetched successfully", cities);
  }

  /**
   * Get a single city by ID
   */
  @Get("show/:id")
  async getCityById(@Param("id", ParseIntPipe) id: number) {
    const city = await this.cityService.getCityById(id);
    return this.formatResponse(true, "City fetched successfully", [city]);
  }

  /**
   * Update a city — supports experience update and new image upload
   */
  @Patch("update/:id")
  @UseInterceptors(FileInterceptor("image", multerConfig("uploads")))
  async updateCity(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: CityUpdateDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const updatedCity = await this.cityService.updateCity(id, {
      ...body,
      image: file?.filename || body.image,
    });
    return this.formatResponse(true, "City updated successfully", [updatedCity]);
  }

  /**
   * Delete a city
   */
  @Delete("delete/:id")
  async deleteCity(@Param("id", ParseIntPipe) id: number) {
    await this.cityService.deleteCity(id);
    return this.formatResponse(true, `City with ID ${id} deleted successfully`);
  }
}
