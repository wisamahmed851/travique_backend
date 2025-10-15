import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dtos/auth.dto";

@Controller('user')
export class UserAuthController{
    constructor(
        private readonly AuthSerice: AuthService,
    ){}

    @Post('register')
    @HttpCode(200)
    async register(@Body() body: AuthDto){}
}
