import { BadRequestException, Injectable, RequestTimeoutException } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { AccessTokenType, JwtPayloadType } from "utils/types";
import { LoginDto } from "./dto/login.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import * as bcrypt from 'bcryptjs';
import { JwtService } from "@nestjs/jwt";
import { MailerService } from "@nestjs-modules/mailer";
import { MailService } from "src/mail/mail.service";
import { randomBytes } from "node:crypto"
import { ConfigService } from "@nestjs/config";
import { ResetPasswordDto } from "./dto/reset-password.dto";


@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
        private readonly config: ConfigService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { email, password, username } = registerDto;
        const userFromDB = await this.userRepository.findOne({ where: { email } });
        if (userFromDB) {
            throw new BadRequestException('User already exists');
        }
        const hashedPassword = await this.hashPassword(password);
        let newUser = this.userRepository.create(
            {
                username,
                email,
                password: hashedPassword,
                verificationToken: randomBytes(32).toString('hex'),
            }
        );
        newUser = await this.userRepository.save(newUser);

        const link = this.generateLink(newUser.id, newUser.verificationToken);

        await this.mailService.sendVerifyEmailTemplate(email, link);

        const accessToken = await this.generateJWT({ id: newUser.id, userRole: newUser.role });
        return { message : 'Verification token has been sent to your email, please verify your email adresse' };
    }


    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new BadRequestException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new BadRequestException('Invalid credentials');
        }

        if (!user.isVerified) {
            let verificationToken = user.verificationToken;
            if (!verificationToken) {
                user.verificationToken = randomBytes(32).toString('hex');
                const result = await this.userRepository.save(user);
                verificationToken = result.verificationToken;
            }
            const link = this.generateLink(user.id, verificationToken);
            await this.mailService.sendVerifyEmailTemplate(email, link);

            return { message : 'Verification token has been sent to your email, please verify your email adresse' };            
        }

        const accessToken = await this.generateJWT({ id: user.id, userRole: user.role });

        // await this.mailService.sendLogInEmail(user);

        return { accessToken };

    }


    async sendResetPasswordLink(email: string) {
        const user = await this.userRepository.findOne({ where: {email} });
        if (!user) {
            throw new BadRequestException('user with given email does not exist');
        }

        user.resetPasswordToken = randomBytes(32).toString('hex');
        const result = await this.userRepository.save(user);

        const resetPasswordLink = `${this.config.get<string>('CLIENT_DOMAIN')}/reset-password/${user.id}/${result.resetPasswordToken}`;
        await this.mailService.sendResetPasswordTemplate(email, resetPasswordLink);

        return { message: 'Password reset link sent to your email, please check your inbox' };
    }

    async getResetPasswordLink(userId: number, resetPasswordToken: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException('Invalid link');
        }
        if (user.resetPasswordToken === null || user.resetPasswordToken !== resetPasswordToken) {
            throw new BadRequestException('Invalid link');
        }

        return { message: 'Valid link' }
    }

    async resetPassword(dto: ResetPasswordDto) {
        const { userId, resetPasswordToken, newPassword } = dto;

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException('Invalid link');
        }
        if (user.resetPasswordToken === null || user.resetPasswordToken !== resetPasswordToken) {
            throw new BadRequestException('Invalid link');
        }

        const hashedPassword = await this.hashPassword(newPassword);
        user.password = hashedPassword;
        user.resetPasswordToken = '';
        await this.userRepository.save(user);

        return { message: 'Password reset successfully, please log in' };
    }

    async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    private generateJWT(payload: JwtPayloadType): Promise<string> {
        return this.jwtService.signAsync(payload);
    }

    private generateLink(userId: number, verificationToken: string) {
        return `${this.config.get<string>('DOMAIN')}/api/users/verify-email/${userId}/${verificationToken}`;
    }

}