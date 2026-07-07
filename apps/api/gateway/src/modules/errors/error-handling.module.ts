import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { StructuredHttpExceptionFilter } from './structured-http-exception.filter.js';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: StructuredHttpExceptionFilter,
    },
  ],
})
export class ErrorHandlingModule {}
