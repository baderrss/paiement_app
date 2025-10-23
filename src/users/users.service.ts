import { userRole } from 'utils/constants';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Auth, Repository } from "typeorm";
import { RegisterDto } from "./dto/register.dto";
import * as bcrypt from 'bcryptjs';
import { LoginDto } from "./dto/login.dto";
import { JwtService } from "@nestjs/jwt";
import { JwtPayloadType, AccessTokenType } from 'utils/types';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from './auth.provider';
import { join } from "node:path"
import { existsSync, statSync, unlinkSync } from "node:fs"
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly authProvider: AuthService,
    ) { }

    async register(registerDto: RegisterDto) {
        return this.authProvider.register(registerDto);
    }


    async login(loginDto: LoginDto) {
        return this.authProvider.login(loginDto);
    }

    async getCurrentUser(id: number): Promise<User> {

        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async getAllUsers(): Promise<User[]> {
        return this.userRepository.find();
    }

    async update(updateUserDto: UpdateUserDto): Promise<User> {
        const { userId, username, password, role } = updateUserDto;
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        user.username = username || user.username;
        if (password) {
            user.password = await this.authProvider.hashPassword(password);
        }
        user.role = (role as userRole);

        return this.userRepository.save(user);
    }

    async delete(id: number, payload: JwtPayloadType) {
        const user = await this.getCurrentUser(id);
        if (user.id === payload?.id || payload.userRole === userRole.ADMIN) {
            await this.userRepository.remove(user);
            return { messag: 'User deleted successfully' };
        }
        throw new ForbiddenException('You are not allowed to delete this user');

    }

    async uploadProfileImage(userId: number, image: string) {
        const user = await this.getCurrentUser(userId);

        if (user.profileImage) {
            // Supprimer l'ancienne image si elle existe
            await this.removeProfileImage(userId);
        }

        user.profileImage = image;
        return this.userRepository.save(user);
    }

    async removeProfileImage(userId: number) {
        const user = await this.getCurrentUser(userId);

        if (!user.profileImage) {
            throw new BadRequestException('There is no profile image to delete');
        }

        // const imagePath = join(process.cwd(), 'images', 'users', user.profileImage);
        const imagePath = join(process.cwd(), `./images/users/${user.profileImage}`);

        // Vérifier si le fichier existe et que c'est bien un fichier
        if (existsSync(imagePath) && statSync(imagePath).isFile()) {
            try {
                unlinkSync(imagePath);
            } catch (err) {
                console.error('Error deleting file:', err);
                throw new BadRequestException('Failed to delete profile image');
            }
        }

        user.profileImage = '';
        return this.userRepository.save(user);
    }

    async verifyEmail(userId: number, verificationToken: string) {
        const user = await this.getCurrentUser(userId);
        if (user.verificationToken === null) {
            throw new NotFoundException('No verification token');
        }

        if (user.verificationToken !== verificationToken) {
            throw new BadRequestException('Invalide link');
        }

        user.isVerified = true;
        user.verificationToken = '';

        await this.userRepository.save(user);

        return { message: 'Your email has been verified, please log in to your account' }
    }

    sendResetPassword(email: string) {
        return this.authProvider.sendResetPasswordLink(email);
    }

    getResetPassword(userId: number, resetPasswordToken: string) {
        return this.authProvider.getResetPasswordLink(userId, resetPasswordToken);
    }

    resetPassword(dto: ResetPasswordDto) {
        return this.authProvider.resetPassword(dto);
    }
}