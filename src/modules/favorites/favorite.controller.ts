import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { Favoriteervice } from './favorite.service';
import { CreateFavoriteDto } from './dtos/favorite.dto';
import { UserJwtAuthGuard } from '../auth/user/user-jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../users/entity/user.entity';
import { NotFoundError } from 'rxjs';

@Controller('Favorite')
export class FavoriteController {
  constructor(private readonly Favoriteervice: Favoriteervice) {}

  // ✅ Add to Favorite
  @Post('add')
  @UseGuards(UserJwtAuthGuard)
  async addFavorite(@CurrentUser() user: User, @Body() dto: CreateFavoriteDto) {
    const data = await this.Favoriteervice.addFavorite(user, dto);
    return {
      success: true,
      message: 'Attraction added to Favorite successfully',
      data,
    };
  }

  // ✅ Get my Favorite
  @Get('me/my-Favorite')
  @UseGuards(UserJwtAuthGuard)
  async getMyFavorite(@CurrentUser() user: User) {
    const data = await this.Favoriteervice.getMyFavorite(user.id);
    return {
      success: true,
      message: 'My Favorite fetched successfully',
      data,
    };
  }

  // ✅ Remove from Favorite
  @Delete(':attractionId')
  @UseGuards(UserJwtAuthGuard)
  async removeFavorite(
    @CurrentUser() user: User,
    @Param('attractionId', ParseIntPipe) attractionId: number,
  ) {
    const result = await this.Favoriteervice.removeFavorite(
      user.id,
      attractionId,
    );
    if(!result) throw NotFoundError;
    return {
      success: true,
      message: result.message,
      data: null,
    };
  }

  // ✅ Check if attraction is favorited (optional)
  @Get('check/:attractionId')
  @UseGuards(UserJwtAuthGuard)
  async checkFavorite(
    @CurrentUser() user: User,
    @Param('attractionId', ParseIntPipe) attractionId: number,
  ) {
    const isFavorited = await this.Favoriteervice.isFavorited(
      user.id,
      attractionId,
    );
    return {
      success: true,
      message: isFavorited
        ? 'Attraction is in Favorite'
        : 'Attraction is not in Favorite',
      data: { isFavorited },
    };
  }
}
