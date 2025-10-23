import { IsNotEmpty, IsNumber, IsString, Length } from "class-validator";

export class CreateProductDto {
    @IsString({ message: 'Title must be a string' })
    @IsNotEmpty({ message: 'Title is required' })
    @Length(3, 50, { message: 'Title must be between 3 and 50 characters' })
    title: string;

    @IsString({ message: 'Description must be a string' })
    @IsNotEmpty({ message: 'Description is required' })
    @Length(10, 200, { message: 'Description must be between 10 and 200 characters' })
    description: string;

    @IsNumber({}, { message: 'Price must be a number' })
    @IsNotEmpty({ message: 'Price is required' })
    price: number;
}