import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  CurrencyNotSupportedException,
  ExchangeRateNotFoundException,
  MonobankApiException,
  CacheException,
} from '../shared/exceptions/currency.exceptions';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  error?: string;
  details?: any;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);
    
    this.logError(exception, request, errorResponse);

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown, request: Request): ErrorResponse {
    const timestamp = new Date().toISOString();
    const path = request.url;
    const method = request.method;

    if (exception instanceof CurrencyNotSupportedException) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp,
        path,
        method,
        message: exception.message,
        error: 'Currency Not Supported',
      };
    }

    if (exception instanceof ExchangeRateNotFoundException) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        timestamp,
        path,
        method,
        message: exception.message,
        error: 'Exchange Rate Not Found',
      };
    }

    if (exception instanceof MonobankApiException) {
      return {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        timestamp,
        path,
        method,
        message: exception.message,
        error: 'External Service Unavailable',
      };
    }

    if (exception instanceof CacheException) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp,
        path,
        method,
        message: 'Temporary service issue, please try again',
        error: 'Cache Error',
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      let message = exception.message;
      let details = undefined;

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || responseObj.error || message;
        if (Array.isArray(responseObj.message)) {
          details = responseObj.message;
          message = 'Validation failed';
        }
      }

      return {
        statusCode: status,
        timestamp,
        path,
        method,
        message,
        error: this.getErrorName(status),
        ...(details && { details }),
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp,
      path,
      method,
      message: 'Internal server error',
      error: 'Internal Server Error',
    };
  }

  private logError(exception: unknown, _request: Request, errorResponse: ErrorResponse) {
    const { statusCode, path, method, message } = errorResponse;
    
    if (statusCode >= 500) {
      this.logger.error(
        `${method} ${path} - ${statusCode} - ${message}`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
      );
    } else if (statusCode >= 400) {
      this.logger.warn(
        `${method} ${path} - ${statusCode} - ${message}`,
      );
    }
  }

  private getErrorName(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.METHOD_NOT_ALLOWED:
        return 'Method Not Allowed';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'Unprocessable Entity';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Too Many Requests';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Internal Server Error';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'Service Unavailable';
      default:
        return 'Error';
    }
  }
}