import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {
    @IsNotEmpty()
    @MaxLength(250)
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    @IsNotEmpty()
    password: string;
}