import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, tap, map } from "rxjs";


@Injectable()
export class LoggerInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        console.log('Before route handler');
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const { method, url } = request;
        const statusCode = response.statusCode;

        console.log(`Request: ${method} ${url}`);
        console.log(`Response Status: ${statusCode}`);

        return next.handle().pipe(map(data => {
            const { password, ...otherData} = data;
            return otherData
        }));
    }

}