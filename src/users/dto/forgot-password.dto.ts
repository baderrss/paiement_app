import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class ForgotPasswordDto {
    @IsNotEmpty()
    @MaxLength(250)
    @IsEmail()
    email: string;
}