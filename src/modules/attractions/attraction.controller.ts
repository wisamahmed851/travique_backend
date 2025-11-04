import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  Delete,
  ParseIntPipe,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { AttractionService } from './attraction.service';
import { CreateAttractionDto, UpdateAttractionDto } from './dtos/attraction.dto';
import { multerConfig } from 'src/common/utils/multer.config';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AdminJwtAuthGuard } from 'src/modules/auth/admin/admin-jwt.guard';

@Controller('admin/attraction')
@UseGuards(AdminJwtAuthGuard)
export class AttractionController {
  constructor(private readonly attractionService: AttractionService) {}

  private formatResponse(success: boolean, message: string, data: any = []) {
    return { success, message, data };
  }

  // ✅ Create
  @Post('store')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'main_image', maxCount: 1 },
        { name: 'gallery', maxCount: 10 },
      ],
      multerConfig('uploads'),
    ),
  )
  async createAttraction(
    @Body() body: CreateAttractionDto,
    @UploadedFiles()
    files: { main_image?: Express.Multer.File[]; gallery?: Express.Multer.File[] },
  ) {
    const mainImageFile = files.main_image?.[0];
    const galleryFiles = files.gallery;

    const attraction = await this.attractionService.createAttraction(
      body,
      mainImageFile?.filename,
      galleryFiles,
    );
    return this.formatResponse(true, 'Attraction created successfully', [attraction]);
  }

  // ✅ Get all
  @Get('list')
  async getAllAttractions() {
    const data = await this.attractionService.getAllAttractions();
    return this.formatResponse(true, 'Attractions fetched successfully', data);
  }

  // ✅ Get one
  @Get('show/:id')
  async getAttractionById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.attractionService.getAttractionById(id);
    return this.formatResponse(true, 'Attraction fetched successfully', [data]);
  }

  // ✅ Update
  @Patch('update/:id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'main_image', maxCount: 1 },
        { name: 'gallery', maxCount: 10 },
      ],
      multerConfig('uploads'),
    ),
  )
  async updateAttraction(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateAttractionDto,
    @UploadedFiles()
    files: { main_image?: Express.Multer.File[]; gallery?: Express.Multer.File[] },
  ) {
    const mainImageFile = files.main_image?.[0];
    const galleryFiles = files.gallery;

    const updated = await this.attractionService.updateAttraction(
      id,
      body,
      mainImageFile?.filename,
      galleryFiles,
    );
    return this.formatResponse(true, 'Attraction updated successfully', [updated]);
  }

  // ✅ Delete
  @Delete('delete/:id')
  async deleteAttraction(@Param('id', ParseIntPipe) id: number) {
    await this.attractionService.deleteAttraction(id);
    return this.formatResponse(true, `Attraction with ID ${id} deleted successfully`);
  }
}
