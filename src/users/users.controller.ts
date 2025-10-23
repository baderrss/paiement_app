import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Headers,
    UseGuards,
    Req,
    Put,
    Delete,
    Param,
    ParseIntPipe,
    ClassSerializerInterceptor,
    UseInterceptors,
    UploadedFiles,
    BadRequestException,
    UploadedFile,
    Res,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { AuthGuard } from "./guards/auth.guard";
import { CurrentUser } from "./decorators/current-user.decarator";
import { JwtPayloadType } from "utils/types";
import { Roles } from "./decorators/user-role.decorator";
import { userRole } from "utils/constants";
import { AuthRolesGuard } from "./guards/auth-roles.guard";
import { UpdateUserDto } from "./dto/update-user.dto";
import { LoggerInterceptor } from "utils/interceptors/logger.interceptor";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { Express, Response } from "express";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { ApiTags } from "@nestjs/swagger";

@Controller('/api/users')
@ApiTags("Users Groupe")
export class UsersController {

    constructor(private readonly usersService: UsersService) { }

    @Post('/auth/register')
    register(@Body() body: RegisterDto) {
        return this.usersService.register(body);
    }

    @HttpCode(HttpStatus.OK)
    @Post('/auth/login')
    login(@Body() body: LoginDto) {
        return this.usersService.login(body);
    }

    @Get('/current-user')
    @UseGuards(AuthGuard)
    // @UseInterceptors(ClassSerializerInterceptor)
    getCurrentUser(@CurrentUser() payload: JwtPayloadType) {
        // console.log('Get current user route handler called');
        return this.usersService.getCurrentUser(payload.id);
    }

    @Get()
    @Roles(userRole.ADMIN) // Only accessible by users with the 'admin' role
    @UseGuards(AuthRolesGuard)
    // @UseInterceptors(ClassSerializerInterceptor)
    getAllUsers() {
        return this.usersService.getAllUsers();
    }

    @Put()
    @UseGuards(AuthGuard)
    update(
        // @CurrentUser() payload: JwtPayloadType,
        @Body() body: UpdateUserDto) {
        // return this.usersService.update(payload.id, body);
        return this.usersService.update(    body);
    }

    @Delete('/:id')
    @UseGuards(AuthGuard)
    delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() payload: JwtPayloadType) {
        return this.usersService.delete(id, payload);
    }

    @Post('upload-image')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('user-image'))
    uploadProfileImage(
        @CurrentUser() payload: JwtPayloadType,
        @UploadedFile() file: Express.Multer.File) {
            if (!file) {
                throw new BadRequestException('no image provided');
            }
            return this.usersService.uploadProfileImage(payload.id, file.filename);
    }

    @Delete('/images/remove-profile-image')
    @UseGuards(AuthGuard)
    deleteProfileImage(@CurrentUser() payload: JwtPayloadType) {
        return this.usersService.removeProfileImage(payload.id);
    }

    @Get('/images/:image')
    // @UseGuards(AuthGuard)
    showProfileImage(@Param('image') image:string, @Res() res: Response) {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        return res.sendFile(image, { root: 'images/users' })
    }

    @Get('verify-email/:id/:verificationToken')
    verifyEmail(
        @Param('id', ParseIntPipe) id: number,
        @Param('verificationToken') verificationToken: string
    ) {
        return this.usersService.verifyEmail(id, verificationToken);
    }

    @Post('/forgot-password')
    @HttpCode(HttpStatus.OK)
    forgotPassword(@Body() body: ForgotPasswordDto) {
        return this.usersService.sendResetPassword(body.email);
    }

    @Get('/reset-password/:id/:resetPasswordToken')
    getResetPassword(
        @Param('id', ParseIntPipe) id: number,
        @Param('resetPasswordToken') resetPasswordToken: string
    ) {
        return this.usersService.getResetPassword(id, resetPasswordToken);
    }

    @Post('reset-password')
    resetPassword(@Body() body: ResetPasswordDto) {
        return this.usersService.resetPassword(body);
    }

}
