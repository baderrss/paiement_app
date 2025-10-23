import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CurrentUser } from 'src/users/decorators/current-user.decarator';
import { Roles } from 'src/users/decorators/user-role.decorator';
import { AuthRolesGuard } from 'src/users/guards/auth-roles.guard';
import { CreateReviewDto } from './dtos/create-review.dto';
import { JwtPayloadType } from 'utils/types';
import { userRole } from 'utils/constants';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('/api/reviews')
@ApiTags('Reviews Groupe')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @UseGuards(AuthRolesGuard)
  @Roles(userRole.ADMIN)
  getAllReviews(
    @Query('pageNumber', ParseIntPipe) pageNumber: number,
    @Query('reviewPerPage', ParseIntPipe) reviewPerPage: number,
  ) {
    return this.reviewsService.findAll(pageNumber, reviewPerPage);
  }

  @Post('/:productId')
  @Roles(userRole.ADMIN, userRole.USER)
  @UseGuards(AuthRolesGuard)
  create(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: CreateReviewDto,
    @CurrentUser() payload: JwtPayloadType,
  ) {
    return this.reviewsService.create(productId, payload.id, body);
  }

  @Get('/product/:productId')
  getReviewsByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewsService.findByProduct(productId);
  }

  @Put('/:reviewId')
  @Roles(userRole.ADMIN, userRole.USER)
  @UseGuards(AuthRolesGuard)
  Update(
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() body: UpdateReviewDto,
    @CurrentUser() payload: JwtPayloadType,
  ) {
    return this.reviewsService.update(reviewId, payload.id, body);
  }

  @Delete('/:reviewId')
  @Roles(userRole.ADMIN, userRole.USER)
  @UseGuards(AuthRolesGuard)
  delete(
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @CurrentUser() payload: JwtPayloadType,
  ) {
    return this.reviewsService.delete(reviewId, payload);
  }
}
