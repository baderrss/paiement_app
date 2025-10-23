import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception.getStatus() === 429) {
      return response.status(429).json({
        statusCode: 429,
        message: 'Trop de requêtes. Réessayez dans quelques instants.',
      });
    }

    // Sinon, laisser les autres erreurs passer normalement
    response
      .status(exception.getStatus())
      .json(exception.getResponse());
  }
}
