import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserLoginDto } from './dtos/user-login.dto';
import { UserAuthService } from './user-auth.service';
import { UserJwtAuthGuard } from './user-jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/modules/users/entity/user.entity';
import { UpdateProfileDto, UserRegisterDto } from './dtos/user-auth.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/common/utils/multer.config';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { OAuth2Client } from 'google-auth-library';

@Controller('user')
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) { }


  @Post('withgoogle')
  async withGoogle(@Body() body: { token: string }) {
    const result = await this.userAuthService.googleLogin(body.token);
    return {
      success: true,
      message: result.message,
      data: {
        user: result.user,
        access_token: result.access_token,
        referes_token: result.refresh_token,
      }
    };
  }
  @Post('register')
  async register(@Body() body: UserRegisterDto) {
    const message = await this.userAuthService.register(body);
    return {
      success: true,
      message: message,
    };
  }

  @Post('otp/verification')
  async otpVerification(@Body() body: { email: string; otp: string }) {
    const result = await this.userAuthService.verifyOtp(body.email, body.otp);
    return {
      success: true,
      message: result.message,
      data: {
        user: {
          id: result.user?.id,
          name: result.user?.name,
        },
        access_token: result.token,
      }
    };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: UserLoginDto) {
    const user = await this.userAuthService.validateUser(body.email, body.password);
    const result = await this.userAuthService.login(user);
    return {
      success: true,
      message: result.message,
      data: { access_token: result.token, refresh_token: result.refresh_token, role: result.role },
    };
  }

  @Post('refresh-token')
  async refreshToken(@Body('refresh_token') refreshToken: string) {
    const result = await this.userAuthService.refreshToken(refreshToken);
    return {
      success: true,
      message: 'Token refreshed successfully',
      data: result,
    };
  }

  @Get('profile')
  @UseGuards(UserJwtAuthGuard)
  async profile(@CurrentUser() user: User) {
    const profile = await this.userAuthService.profile(user);
    return { success: true, message: 'Profile fetched successfully', data: profile };
  }

  @Post('update-profile')
  @UseGuards(UserJwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', multerConfig('uploads')))
  async profileUpdate(
    @CurrentUser() user: User,
    @Body() body: UpdateProfileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const updated = await this.userAuthService.profileUpdate(user, file ? { ...body, image: file.filename } : body);
    return { success: true, message: 'Profile updated successfully', data: updated };
  }

  @Post('change-password')
  @UseGuards(UserJwtAuthGuard)
  async changePassword(@Body() body: { oldPassword: string; newPassword: string }, @CurrentUser() user: User) {
    await this.userAuthService.changePassword(body, user);
    return { success: true, message: 'Password updated successfully' };
  }

  @Post('logout')
  @UseGuards(UserJwtAuthGuard)
  async logout(@CurrentUser() user: User) {
    await this.userAuthService.logout(user);
    return { success: true, message: 'User logged out successfully' };
  }

}
