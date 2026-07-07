import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

interface HttpRequestContext {
  method?: string;
  url?: string;
  id?: string;
  correlationId?: string;
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<HttpRequestContext>();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        this.logger.log({
          event: 'http_request_completed',
          correlationId: request.correlationId ?? 'unassigned',
          method: request.method ?? 'UNKNOWN',
          requestId: request.id ?? 'unassigned',
          durationMs: Date.now() - startedAt,
          path: request.url ?? 'unknown',
        });
      }),
    );
  }
}
