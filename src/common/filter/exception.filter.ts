import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorPayload } from '../../common/payload/error.payload';
import { ResponsePayload } from '../../common/payload/response.payload';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor() {}

  async catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse<Response>();

    // 이미 응답이 나갔으면 아무 것도 하지 말고 종료
    if (response.headersSent) {
      // 필요하면 로깅만 남기기
      // console.warn('[AllExceptionFilter] headers already sent:', exception);
      return;
    }

    let statusCode: number = 200;
    let res: ResponsePayload;
    if (exception instanceof ResponsePayload) {
      res = exception;
    } else if (exception instanceof ErrorPayload) {
      res = new ResponsePayload(null, exception);
    } else if (exception instanceof BadRequestException) {
      statusCode = 400;
      const validationErrorMsg = this.extractValidationErrorMsg(exception.getResponse());
      res = new ResponsePayload(null, new ErrorPayload(validationErrorMsg));
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      res = new ResponsePayload(null, new ErrorPayload(exception.message));
    } else {
      console.log(exception);

      // slack

      statusCode = 500;
      res = new ResponsePayload(null, new ErrorPayload('Internal Server Error'));
    }

    // exception 발생 시 loggerService.create

    response.status(statusCode).json(res);
  }

  private extractValidationErrorMsg(response: any): string {
    const validationResponse = response as { message: any; error: string; statusCode: number };
    if (Array.isArray(validationResponse.message)) {
      return validationResponse.message.join(', ');
    }
    return validationResponse.message;
  }
}
