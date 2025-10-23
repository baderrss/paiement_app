import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, RequestTimeoutException } from "@nestjs/common";
    import { User } from "src/users/entities/user.entity";


@Injectable()
export class MailService {

    constructor(
        private readonly mailerService: MailerService,
    ) { }

    async sendLogInEmail(user: User) {
        try {
            const today = new Date();
            await this.mailerService.sendMail({
                to: user.email,
                from: `<no-reply@my-nest-js.com>`,
                subject: 'Log in',
                template: 'login',
                context: {user, today}
            })
        } catch (error) {
            console.log(error)
            throw new RequestTimeoutException('')
        }
    }


    async sendVerifyEmailTemplate(email: string, link: string) {
        try {
            const today = new Date();
            await this.mailerService.sendMail({
                to: email,
                from: `<no-reply@my-nest-js.com>`,
                subject: 'Verify your email address',
                template: 'verify-email',
                context: {link}
            })
        } catch (error) {
            console.log(error)
            throw new RequestTimeoutException('')
        }
    }


    async sendResetPasswordTemplate(email: string, resetPasswordLink: string) {
        try {
            const today = new Date();
            await this.mailerService.sendMail({
                to: email,
                from: `<no-reply@my-nest-js.com>`,
                subject: 'Reset password',
                template: 'reset-password',
                context: {resetPasswordLink}
            })
        } catch (error) {
            console.log(error)
            throw new RequestTimeoutException('')
        }
    }
}