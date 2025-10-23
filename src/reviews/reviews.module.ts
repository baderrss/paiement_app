import { Module } from "@nestjs/common";
import { ReviewsController } from "./reviews.controller";
import { Review } from "./entities/review.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReviewsService } from "./reviews.service";
import { ProductsModule } from "src/products/products.module";
import { UsersModule } from "src/users/users.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports: [
        TypeOrmModule.forFeature([Review]),
        ProductsModule,
        UsersModule,
        JwtModule
    ],
    controllers: [ReviewsController],
    providers: [ReviewsService],
})
export class ReviewsModule {}