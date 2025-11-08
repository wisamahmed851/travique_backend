import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entity/review.entity';
import { CreateReviewDto, UpdateReviewDto } from './dtos/review.dto';
import { User } from '../users/entity/user.entity';
import { Attraction } from '../attractions/entity/attraction.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Attraction)
    private readonly attractionRepo: Repository<Attraction>,
  ) { }

  private handleError(error: any) {
    console.error('ReviewService Error:', error);
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException
    )
      throw error;
    throw new InternalServerErrorException('Something went wrong');
  }

  // ✅ Create or Update if already exists
  async createOrUpdateReview(user: User, dto: CreateReviewDto) {
    try {
      const attraction = await this.attractionRepo.findOne({
        where: { id: dto.attraction_id },
      });
      if (!attraction) throw new NotFoundException('Attraction not found');

      // Check if this user already reviewed this attraction
      let existingReview = await this.reviewRepo.findOne({
        where: { user_id: user.id, attraction_id: dto.attraction_id },
      });

      if (existingReview) {
        // Update existing review
        existingReview.rating = dto.rating;
        existingReview.comment = dto.comment ?? '';
        const updated = await this.reviewRepo.save(existingReview);
        return { isNew: false, data: updated };
      }

      // Create new review
      const newReview = this.reviewRepo.create({
        ...dto,
        user_id: user.id,
      });
      const saved = await this.reviewRepo.save(newReview);
      return { isNew: true, data: saved };
    } catch (error) {
      this.handleError(error);
    }
  }

  // ✅ Get all (Admin or public)
  async getAllReviews() {
    try {
      return await this.reviewRepo.find({
        relations: ['user', 'attraction'],
        order: { id: 'DESC' },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  // ✅ Get one
  async getReviewById(id: number) {
    try {
      const review = await this.reviewRepo.findOne({
        where: { id },
        relations: ['user', 'attraction'],
      });
      if (!review) throw new NotFoundException('Review not found');
      return review;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ✅ Get reviews of current user
  async getMyReviews(userId: number) {
    try {
      return await this.reviewRepo.find({
        where: { user_id: userId },
        relations: ['attraction'],
        order: { id: 'DESC' },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  // ✅ Update (only by owner)
  async updateReview(userId: number, id: number, dto: UpdateReviewDto) {
    try {
      const review = await this.reviewRepo.findOne({
        where: { id, user_id: userId },
      });
      if (!review)
        throw new NotFoundException('Review not found or not authorized');

      Object.assign(review, dto);
      return await this.reviewRepo.save(review);
    } catch (error) {
      this.handleError(error);
    }
  }

  // ✅ Delete (only by owner)
  async deleteReview(userId: number, id: number) {
    try {
      const review = await this.reviewRepo.findOne({
        where: { id, user_id: userId },
      });
      if (!review)
        throw new NotFoundException('Review not found or not authorized');
      await this.reviewRepo.remove(review);
      return { message: 'Review deleted successfully' };
    } catch (error) {
      this.handleError(error);
    }
  }
}
