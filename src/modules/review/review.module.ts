import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entity/review.entity';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { Attraction } from '../attractions/entity/attraction.entity';
import { User } from '../users/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, User, Attraction])],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
