import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { type Response } from 'express';
import {
  ForbiddenOrganisationAccessError,
  InactiveUserError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  IdentityError,
} from '@certisphere/identity';

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
    const statusCode = this.resolveStatusCode(exception);
    const errorCode = this.resolveErrorCode(exception);

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

  private resolveStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    if (
      exception instanceof InvalidCredentialsError ||
      exception instanceof InvalidRefreshTokenError
    ) {
      return HttpStatus.UNAUTHORIZED;
    }

    if (
      exception instanceof InactiveUserError ||
      exception instanceof ForbiddenOrganisationAccessError
    ) {
      return HttpStatus.FORBIDDEN;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private resolveErrorCode(exception: unknown): string {
    if (exception instanceof IdentityError) {
      return exception.code;
    }

    if (!(exception instanceof HttpException)) {
      return 'INTERNAL_SERVER_ERROR';
    }

    const response = exception.getResponse();

    if (typeof response === 'object' && 'code' in response) {
      const code = response.code;
      return typeof code === 'string' ? code : exception.name;
    }

    return exception.name;
  }

  private resolveMessage(exception: unknown): string {
    if (exception instanceof IdentityError) {
      return exception.message;
    }

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
