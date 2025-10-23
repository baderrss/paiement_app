import { UsersModule } from './../users/users.module';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { ProductsController } from "./products.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { ProductsService } from "./products.service";
import { JwtModule } from '@nestjs/jwt';
import { LoggerMiddleware } from 'utils/middlewares/logger.middleware';

@Module({
    imports: [
        TypeOrmModule.forFeature([Product]),
        UsersModule,
        JwtModule],
    controllers: [ProductsController],
    providers: [ProductsService],
    exports: [ProductsService]
})
export class ProductsModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(LoggerMiddleware)
            .forRoutes({
                path: 'api/products', // '*'
                method: RequestMethod.PUT
            })
    }
} 