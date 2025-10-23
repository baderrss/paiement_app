import { JwtPayloadType } from './../../utils/types';
import { UsersService } from './../users/users.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { ProductsService } from 'src/products/products.service';
import { CreateReviewDto } from './dtos/create-review.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { userRole } from 'utils/constants';
import { take } from 'rxjs';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
  ) {}

  async create(productId: number, userId: number, dto: CreateReviewDto) {
    const product = await this.productsService.findOne(productId);
    if (!product) throw new NotFoundException('Product not found');

    const user = await this.usersService.getCurrentUser(userId);
    if (!user) throw new NotFoundException('User not found');

    const review = this.reviewsRepository.create({
      ...dto,
      product,
      user,
    });

    const result = await this.reviewsRepository.save(review);

    return {
      id: result.id,
      comment: result.comment,
      rating: result.rating,
      createdAt: result.createdAt,
      userId: user,
      productId: product,
    };
  }

  async findByProduct(productId: number) {
    return this.reviewsRepository.find({
      where: { product: { id: productId } },
      order: { createdAt: 'DESC' },
      relations: ['user'], // si tu veux afficher le nom de l’auteur du review
    });
  }

  findAll(pageNumber: number, reviewPerPage: number): Promise<Review[]> {
    return this.reviewsRepository.find({
      skip: reviewPerPage * (pageNumber - 1),
      take: reviewPerPage,
      order: { createdAt: 'DESC' },
    });
  }

  async update(reviewId: number, userId: number, dto: UpdateReviewDto) {
    const review = await this.getReviewBy(reviewId);
    if (review.user.id !== userId) {
      throw new ForbiddenException('access denied, your are not allowed');
    }

    review.rating = dto.rating ?? review.rating;
    review.comment = dto.comment ?? review.comment;
    return this.reviewsRepository.save(review);
  }

  async delete(reviewId: number, payload: JwtPayloadType) {
    const review = await this.getReviewBy(reviewId);
    if (review.user.id === payload.id || payload.userRole === userRole.ADMIN) {
      await this.reviewsRepository.remove(review);
      return { message: 'Review has been deleted' };
    }
    throw new ForbiddenException('access denied, you are not allowed');
  }

  private async getReviewBy(id: number) {
    const review = await this.reviewsRepository.findOne({ where: { id: id } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }
}
