import { Controller, Post, Get, Param, Body, ParseIntPipe, Patch, UseGuards } from "@nestjs/common";
import { CityService } from "./city.service";
import { AdminJwtAuthGuard } from "src/modules/auth/admin/admin-jwt.guard";
import { CurrentUser } from "src/common/decorators/current-user.decorator";

@Controller('admin/city')
@UseGuards(AdminJwtAuthGuard)
export class CityController {
    constructor(private readonly cityService: CityService) { }

    @Post('store')
    createCity(@Body('name') name: string, @CurrentUser('id') created_by: number) {
        return this.cityService.createCity(name, created_by);
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
    updateCity(@Param('id', ParseIntPipe) id: number, @Body('name') name: string) {
        return this.cityService.updateCity(id, name);
    }


}
