import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @Length(2, 50)
  @IsOptional()
  username: string;

  @IsNotEmpty()
  @MaxLength(250)
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @Length(8, 8, { message: 'CIN must contain exactly 8 digits' })
  cin?: string;

  @IsOptional()
  @Length(16, 16, { message: 'RIB must contain exactly 16 digits' })
  rib?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  banque?: string;

  @IsOptional()
  @Matches(/^[0-9]{8}$/, { message: 'Phone number must be 8 digits' })
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  specialite?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  roleAsked?: string;
}
