import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attraction } from '../attractions/entity/attraction.entity';
import { CreateFavoriteDto } from './dtos/favorite.dto';
import { User } from '../users/entity/user.entity';
import { Favorite } from './entity/favorite.entity';

@Injectable()
export class Favoriteervice {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,

    @InjectRepository(Attraction)
    private readonly attractionRepo: Repository<Attraction>,
  ) {}

  private handleError(error: any) {
    console.error('Favoriteervice Error:', error);
    if (error instanceof NotFoundException || error instanceof ConflictException)
      throw error;
    throw new InternalServerErrorException('Something went wrong');
  }

  // ✅ Add favorite
  async addFavorite(user: User, dto: CreateFavoriteDto) {
    try {
      const attraction = await this.attractionRepo.findOne({
        where: { id: dto.attraction_id },
      });
      if (!attraction) throw new NotFoundException('Attraction not found');

      const existing = await this.favoriteRepo.findOne({
        where: { user_id: user.id, attraction_id: dto.attraction_id },
      });

      if (existing)
        throw new ConflictException('Attraction already in Favorite');

      const favorite = this.favoriteRepo.create({
        user_id: user.id,
        attraction_id: dto.attraction_id,
      });

      const saved = await this.favoriteRepo.save(favorite);
      return saved;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ✅ Get my Favorite
  async getMyFavorite(userId: number) {
    try {
      return await this.favoriteRepo.find({
        where: { user_id: userId },
        relations: ['attraction'],
        order: { created_at: 'DESC' },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  // ✅ Remove from Favorite
  async removeFavorite(userId: number, attractionId: number) {
    try {
      const favorite = await this.favoriteRepo.findOne({
        where: { user_id: userId, attraction_id: attractionId },
      });

      if (!favorite)
        throw new NotFoundException('Favorite not found for this attraction');

      await this.favoriteRepo.remove(favorite);
      return { message: 'Removed from Favorite successfully' };
    } catch (error) {
      this.handleError(error);
    }
  }

  // ✅ Check if attraction is favorited
  async isFavorited(userId: number, attractionId: number) {
    const favorite = await this.favoriteRepo.findOne({
      where: { user_id: userId, attraction_id: attractionId },
    });
    return !!favorite;
  }
}
