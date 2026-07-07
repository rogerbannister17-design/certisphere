import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { type NextFunction, type Request, type Response } from 'express';

type CorrelatedRequest = Request & {
  correlationId?: string;
};

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(request: CorrelatedRequest, response: Response, next: NextFunction): void {
    const incomingCorrelationId = request.header('x-correlation-id');
    const correlationId =
      incomingCorrelationId !== undefined && incomingCorrelationId.trim() !== ''
        ? incomingCorrelationId
        : randomUUID();

    request.correlationId = correlationId;
    response.setHeader('x-correlation-id', correlationId);
    next();
  }
}
