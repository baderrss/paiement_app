import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, Res, ValidationPipe, UseGuards, Query, Search } from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Request, Response } from "express";
import { ProductsService } from "./products.service";
import { AuthRolesGuard } from "src/users/guards/auth-roles.guard";
import { CurrentUser } from "src/users/decorators/current-user.decarator";
import { JwtPayloadType } from "utils/types";
import { Roles } from "src/users/decorators/user-role.decorator";
import { userRole } from "utils/constants";
import { ApiTags } from "@nestjs/swagger";
import { ApiQuery } from "@nestjs/swagger";
import { SkipThrottle, Throttle } from "@nestjs/throttler";

@Controller('/api/products')
@ApiTags("Products Groupe")
// @SkipThrottle()
export class ProductsController {

    constructor(private readonly productsService: ProductsService) {}

    @Post()
    @UseGuards(AuthRolesGuard)
    @Roles(userRole.ADMIN)
    createProduct(@Body() body: CreateProductDto, @CurrentUser() payload: JwtPayloadType) {
        return this.productsService.create(payload.id, body);
    }

    @Get()
    @ApiQuery({
        name: 'title',
        required: false,
        type: 'string',
        description: 'search based on product title',
        example: 'product title'
    })
    @ApiQuery({
        name: 'minPrice',
        required: false,
        type: 'string',
        description: 'search based on minimum price',
        example : 100
    })
    @ApiQuery({
        name: 'maxPrice',
        required: false,
        type: 'string',
        description: 'search based on maximum price',
        example: 200
    })
    getProducts(
        @Query('title') search: string,
        @Query('minPrice') minPrice: string,
        @Query('maxPrice') maxPrice: string
        ) { 
        return this.productsService.findAll(search, minPrice, maxPrice);
    }

    @Get('/:id')
    @SkipThrottle()
    getProduct(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findOne(id); 
    }

    @Put('/:id')
    @UseGuards(AuthRolesGuard)
    @Roles(userRole.ADMIN)
    updateProduct(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateProductDto) {
        return this.productsService.update(id, body);
    }

    @Delete('/:id')
    @Throttle({ default: {
        ttl: 10000,
        limit: 3
    } })
    @UseGuards(AuthRolesGuard)
    @Roles(userRole.ADMIN)
    deleteProduct(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.remove(id); 
    }
}