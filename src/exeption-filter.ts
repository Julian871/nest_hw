import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === 400 || status === 401) {
      const errorResponse: any = {
        errorsMessages: [],
      };
      const responseBody: any = exception.getResponse();

      if (Array.isArray(responseBody.message)) {
        responseBody.message.forEach((m) => {
          errorResponse.errorsMessages.push({
            message: 'Incorrect ' + m.field,
            field: m.field,
          });
        });
      } else {
        errorResponse.errorsMessages.push({
          message: 'Incorrect ' + responseBody.message,
          field: responseBody.message,
        });
      }

      response.status(status).json(errorResponse);
    } else if (status === 401) {
      response.sendStatus(status);
    } else if (status === 403) {
      response.sendStatus(status);
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
