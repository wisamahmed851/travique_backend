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
  NotFoundException,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto, UpdateReviewDto } from './dtos/review.dto';
import { UserJwtAuthGuard } from '../auth/user/user-jwt.guard';
import { User } from '../users/entity/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { NotFoundError } from 'rxjs';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) { }

  // ✅ Create or Update review (Authenticated)
  @Post('store')
  @UseGuards(UserJwtAuthGuard)
  async createOrUpdateReview(
    @CurrentUser() user: User,
    @Body() dto: CreateReviewDto,
  ) {
    const review = await this.reviewService.createOrUpdateReview(user, dto);
    if (!review) throw NotFoundError;
    const message = review.isNew
      ? 'Review created successfully'
      : 'Review updated successfully';
    return {
      success: true,
      message,
      data: review.data,
    };
  }

  // ✅ Get all reviews (Public)
  @Get('all')
  async getAllReviews() {
    const reviews = await this.reviewService.getAllReviews();
    return {
      success: true,
      message: 'All reviews fetched successfully',
      data: reviews,
    };
  }

  // ✅ Get single review
  @Get(':id')
  async getReviewById(@Param('id', ParseIntPipe) id: number) {
    const review = await this.reviewService.getReviewById(id);
    return {
      success: true,
      message: 'Review fetched successfully',
      data: review,
    };
  }

  // ✅ Get my reviews (Authenticated)
  @Get('me/my-reviews')
  @UseGuards(UserJwtAuthGuard)
  async getMyReviews(@CurrentUser() user: User) {
    const reviews = await this.reviewService.getMyReviews(user.id);
    return {
      success: true,
      message: 'My reviews fetched successfully',
      data: reviews,
    };
  }

  // ✅ Update my review
  @Patch(':id')
  @UseGuards(UserJwtAuthGuard)
  async updateReview(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReviewDto,
  ) {
    const updated = await this.reviewService.updateReview(user.id, id, dto);
    return {
      success: true,
      message: 'Review updated successfully',
      data: updated,
    };
  }

  // ✅ Delete my review
  @Delete(':id')
  @UseGuards(UserJwtAuthGuard)
  async deleteReview(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.reviewService.deleteReview(user.id, id);
    if (!result) throw undefined;
    return {
      success: true,
      message: result.message,
      data: null,
    };
  }
}
