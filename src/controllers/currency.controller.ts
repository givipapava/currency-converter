import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UseGuards } from '@nestjs/common';
import { CurrencyConversionDto } from '../shared/dto/currency-conversion.dto';
import { CurrencyConversionService } from '../currency/services/currency-conversion.service';
import { CurrencyConversionResponse } from '../shared/interfaces/currency.interface';

@Controller('currency')
@UseGuards(ThrottlerGuard)
export class CurrencyController {
  constructor(
    private readonly currencyConversionService: CurrencyConversionService,
  ) {}

  @Post('convert')
  @HttpCode(HttpStatus.OK)
  async convertCurrency(
    @Body() conversionDto: CurrencyConversionDto,
  ): Promise<CurrencyConversionResponse> {
    return this.currencyConversionService.convertCurrency(conversionDto);
  }

  @Get('supported')
  async getSupportedCurrencies(): Promise<{ currencies: string[] }> {
    const currencies = await this.currencyConversionService.getSupportedCurrencies();
    return { currencies };
  }

  @Get('rates')
  async getAvailableRates(): Promise<{
    rates: Array<{
      from: string;
      to: string;
      rate: number;
      lastUpdated: Date;
    }>;
  }> {
    const rates = await this.currencyConversionService.getAvailableRates();
    return { rates };
  }
}