import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteController } from './favorite.controller';
import { Favoriteervice } from './favorite.service';
import { Attraction } from '../attractions/entity/attraction.entity';
import { Favorite } from './entity/favorite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Attraction])],
  controllers: [FavoriteController],
  providers: [Favoriteervice],
  exports: [Favoriteervice],
})
export class FavoriteModule {}
