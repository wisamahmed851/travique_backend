import { Controller, Post, Get, Param, Body, ParseIntPipe, Patch, UseGuards, UseInterceptors, UploadedFile } from "@nestjs/common";
import { CityService } from "./city.service";
import { AdminJwtAuthGuard } from "src/modules/auth/admin/admin-jwt.guard";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { CityStoreDto, CityUpdateDto } from "./dtos/city.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerConfig } from "src/common/utils/multer.config";

@Controller('admin/city')
@UseGuards(AdminJwtAuthGuard)
export class CityController {
    constructor(private readonly cityService: CityService) { }

    @Post('store')
    @UseInterceptors(FileInterceptor('image', multerConfig('uploads')))
    createCity(
        @Body() city: CityStoreDto,
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser('id') created_by: number
    ) {
        return this.cityService.createCity({ ...city, image: file.filename }, created_by);
    }

    @Get('list')
    getAllCities() {
        return this.cityService.getAllCities();
    }

    @Get('show/:id')
    getCityById(@Param('id', ParseIntPipe) id: number) {
        return this.cityService.getCityById(id);
    }

    @Patch('update/:id')
    updateCity(@Param('id', ParseIntPipe) id: number, @Body() body: CityUpdateDto) {
        return this.cityService.updateCity(id, body);
    }


}
