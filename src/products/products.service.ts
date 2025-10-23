import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { Repository, Like, Between } from "typeorm";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { UsersService } from "src/users/users.service";

@Injectable()
export class ProductsService {

    constructor(
        @InjectRepository(Product)
        private readonly productsRepository: Repository <Product>,
        private readonly usersService: UsersService,
    ) {}


    async create(id: number, dto : CreateProductDto) {
        const user = await this.usersService.getCurrentUser(id);
        const product = this.productsRepository.create({
            ...dto,
            title: dto.title.toLowerCase(),
            user,
        });
        return this.productsRepository.save(product);
    }

    findAll(title?: string, minPrice?: String, maxPrice?: string): Promise<Product[]> {
        const filters = {
            ...(title ? { title: Like(`%${title.toLowerCase()}%`) } : {}),
            ...(minPrice && maxPrice ? { price: Between(Number(minPrice), Number(maxPrice)) } : {}),
        }
        return this.productsRepository.find({ relations: { user: true, reviews: true }, where: filters });
    }

    findOne(id: number): Promise<Product | null> {
        return this.productsRepository.findOne({ where: { id }, relations: { user: true, reviews: true } });
    }

    update(id: number, dto: UpdateProductDto): Promise<Product> {
        return this.productsRepository.save({ ...dto, id });
    }

    remove(id: number): Promise<void> {
        return this.productsRepository.delete(id).then(() => {});
    }
}