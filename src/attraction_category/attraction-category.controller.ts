import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { AttractionCategoryService } from "./attraction-category.service";
import { AdminJwtAuthGuard } from "src/modules/auth/admin/admin-jwt.guard";
import {
  AttractionCategoryStoreDto,
  AttractionCategoryUpdateDto,
} from "./dtos/attraction-category.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerConfig } from "src/common/utils/multer.config";

@Controller("admin/attraction-category")
@UseGuards(AdminJwtAuthGuard)
export class AttractionCategoryController {
  constructor(private readonly categoryService: AttractionCategoryService) {}

  private formatResponse(success: boolean, message: string, data: any = []) {
    return { success, message, data };
  }

  @Post("store")
  @UseInterceptors(FileInterceptor("image", multerConfig("uploads")))
  async createCategory(
    @Body() body: AttractionCategoryStoreDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const category = await this.categoryService.createCategory({
      ...body,
      image: file?.filename,
    });
    return this.formatResponse(true, "Category created successfully", [category]);
  }

  @Get("list")
  async getAllCategories() {
    const categories = await this.categoryService.getAllCategories();
    return this.formatResponse(true, "Categories fetched successfully", categories);
  }

  @Get("show/:id")
  async getCategoryById(@Param("id", ParseIntPipe) id: number) {
    const category = await this.categoryService.getCategoryById(id);
    return this.formatResponse(true, "Category fetched successfully", [category]);
  }

  @Patch("update/:id")
  @UseInterceptors(FileInterceptor("image", multerConfig("uploads")))
  async updateCategory(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: AttractionCategoryUpdateDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const updated = await this.categoryService.updateCategory(id, {
      ...body,
      image: file?.filename || body.image,
    });
    return this.formatResponse(true, "Category updated successfully", [updated]);
  }

  @Delete("delete/:id")
  async deleteCategory(@Param("id", ParseIntPipe) id: number) {
    await this.categoryService.deleteCategory(id);
    return this.formatResponse(true, `Category with ID ${id} deleted successfully`);
  }
}
