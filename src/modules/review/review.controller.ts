import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto, UpdateReviewDto } from './dtos/review.dto';
import { UserJwtAuthGuard } from '../auth/user/user-jwt.guard';
import { User } from '../users/entity/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // ✅ Create review (Authenticated)
  @Post('store')
  @UseGuards(UserJwtAuthGuard)
  async createReview(
    @CurrentUser() user: User,
    @Body() dto: CreateReviewDto,
  ) {
    return await this.reviewService.createReview(user, dto);
  }

  // ✅ Get all reviews (public)
  @Get('all')
  async getAllReviews() {
    return await this.reviewService.getAllReviews();
  }

  // ✅ Get single review
  @Get(':id')
  async getReviewById(@Param('id', ParseIntPipe) id: number) {
    return await this.reviewService.getReviewById(id);
  }

  // ✅ Get my reviews (Authenticated)
  @Get('me/my-reviews')
  @UseGuards(UserJwtAuthGuard)
  async getMyReviews(@CurrentUser() user: User) {
    return await this.reviewService.getMyReviews(user.id);
  }

  // ✅ Update my review
  @Patch(':id')
  @UseGuards(UserJwtAuthGuard)
  async updateReview(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReviewDto,
  ) {
    return await this.reviewService.updateReview(user.id, id, dto);
  }

  // ✅ Delete my review
  @Delete(':id')
  @UseGuards(UserJwtAuthGuard)
  async deleteReview(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.reviewService.deleteReview(user.id, id);
  }
}
