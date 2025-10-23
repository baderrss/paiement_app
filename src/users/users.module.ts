import { BadRequestException, Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.provider";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { MailModule } from "src/mail/mail.module";

@Module({
    imports: [
        MailModule,
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                global: true,
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get<string>('JWT_EXPIRATION_TIME'),
                },
            }),
        }),
        MulterModule.register({
            storage: diskStorage({
                destination: './images/users',
                filename: (req, file, cb) => {
                    const prefix = `${Date.now()}-${Math.round(Math.random() * 1000000)}`;
                    const filename = `${prefix}-${file.originalname}`;
                    cb(null, filename);
                }
            }),
            fileFilter: (req, file, cb) => {
                if (file.mimetype.startsWith('image')) {
                    cb(null, true)
                } else {
                    cb(new BadRequestException('Unsupported file format'), false)
                }
            },
            limits: { fileSize: 1024 * 1024 } // 1 Mb
        })
    ],
    controllers: [UsersController],
    providers: [
        UsersService,
        AuthService],
    exports: [UsersService],
})
export class UsersModule { }
