import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { type Response } from 'express';

interface ErrorRequestContext {
  readonly method?: string;
  readonly url?: string;
  readonly correlationId?: string;
}

@Catch()
export class StructuredHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(StructuredHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const httpContext = host.switchToHttp();
    const response = httpContext.getResponse<Response>();
    const request = httpContext.getRequest<ErrorRequestContext>();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorCode =
      exception instanceof HttpException ? this.resolveErrorCode(exception) : 'INTERNAL_SERVER_ERROR';

    this.logger.error({
      event: 'http_request_failed',
      correlationId: request.correlationId ?? 'unassigned',
      method: request.method ?? 'UNKNOWN',
      path: request.url ?? 'unknown',
      statusCode,
      errorCode,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(statusCode).json({
      error: {
        code: errorCode,
        message: this.resolveMessage(exception),
        correlationId: request.correlationId ?? 'unassigned',
      },
    });
  }

  private resolveErrorCode(exception: HttpException): string {
    const response = exception.getResponse();

    if (typeof response === 'object' && 'code' in response) {
      const code = response.code;
      return typeof code === 'string' ? code : exception.name;
    }

    return exception.name;
  }

  private resolveMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'object' && 'message' in response) {
        const message = response.message;
        return typeof message === 'string' ? message : exception.message;
      }

      return exception.message;
    }

    return 'An unexpected error occurred.';
  }
}
