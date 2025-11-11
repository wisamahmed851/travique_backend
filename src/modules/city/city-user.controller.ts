import { Controller, Get, Param, ParseIntPipe, Query, Search } from "@nestjs/common";
import { CityService } from "./city.service";

@Controller("city")
export class CityUserController {
    constructor(private readonly cityService: CityService) { }

    private formatResponse(success: boolean, message: string, data: any = []) {
        return { success, message, data };
    }

    @Get("home")
    async home() {
        const popularcities = await this.cityService.home();
        return this.formatResponse(true, "Popular cities", popularcities);
    }

    @Get()
    async index(
        @Query("search") search?: string,
        @Query("experienceId") experienceId?: number,
    ) {
        const cities = await this.cityService.getAllCities(search, experienceId)
    }

    @Get("show/:id")
    async getCityById(
        @Param("id", ParseIntPipe) id: number,
    ) {
        const city = await this.cityService.getCityById(id);
        return this.formatResponse(true, "City fetched successfully", [city]);
    }
}