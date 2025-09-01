import { HttpException, HttpStatus } from '@nestjs/common';

export class CurrencyNotSupportedException extends HttpException {
  constructor(currency: string) {
    super(`Currency ${currency} is not supported`, HttpStatus.BAD_REQUEST);
  }
}

export class ExchangeRateNotFoundException extends HttpException {
  constructor(from: string, to: string) {
    super(
      `Exchange rate from ${from} to ${to} not found`,
      HttpStatus.NOT_FOUND,
    );
  }
}

export class MonobankApiException extends HttpException {
  constructor(message: string) {
    super(`Monobank API error: ${message}`, HttpStatus.SERVICE_UNAVAILABLE);
  }
}

export class CacheException extends HttpException {
  constructor(message: string) {
    super(`Cache error: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}