import { Injectable, Logger } from '@nestjs/common';
import { CurrencyConversionRequest, CurrencyConversionResponse } from '../../shared/interfaces/currency.interface';
import { CurrencyRateRepository } from '../repositories/currency-rate.repository';
import { DirectConversionStrategy } from '../strategies/direct-conversion.strategy';
import { CrossConversionStrategy } from '../strategies/cross-conversion.strategy';
import { ConversionStrategy } from '../interfaces/conversion-strategy.interface';
import { 
  CurrencyNotSupportedException, 
  ExchangeRateNotFoundException 
} from '../../shared/exceptions/currency.exceptions';
import { SUPPORTED_CURRENCIES } from '../../shared/constants/currency-codes';

@Injectable()
export class CurrencyConversionService {
  private readonly logger = new Logger(CurrencyConversionService.name);
  private readonly strategies: ConversionStrategy[];

  constructor(
    private readonly currencyRateRepository: CurrencyRateRepository,
    private readonly directConversionStrategy: DirectConversionStrategy,
    private readonly crossConversionStrategy: CrossConversionStrategy,
  ) {
    this.strategies = [
      this.directConversionStrategy,
      this.crossConversionStrategy,
    ];
  }

  async convertCurrency(request: CurrencyConversionRequest): Promise<CurrencyConversionResponse> {
    const { from, to, amount } = request;

    this.logger.log(`Converting ${amount} ${from} to ${to}`);

    this.validateCurrency(from);
    this.validateCurrency(to);

    if (from === to) {
      return {
        from,
        to,
        amount,
        convertedAmount: amount,
        rate: 1,
        timestamp: new Date(),
      };
    }

    const rates = await this.currencyRateRepository.getAllRates();

    for (const strategy of this.strategies) {
      if (strategy.canHandle(from, to, rates)) {
        try {
          const result = await strategy.convert(amount, from, to, rates);
          
          this.logger.log(
            `Conversion successful using ${strategy.constructor.name}: ${amount} ${from} = ${result.convertedAmount} ${to} (rate: ${result.rate})`
          );

          return {
            from,
            to,
            amount,
            convertedAmount: Math.round(result.convertedAmount * 100) / 100,
            rate: Math.round(result.rate * 10000) / 10000,
            timestamp: new Date(),
          };
        } catch (error) {
          this.logger.warn(`Strategy ${strategy.constructor.name} failed: ${error.message}`);
          continue;
        }
      }
    }

    throw new ExchangeRateNotFoundException(from, to);
  }

  private validateCurrency(currency: string): void {
    if (!SUPPORTED_CURRENCIES[currency] && currency !== 'UAH') {
      throw new CurrencyNotSupportedException(currency);
    }
  }

  async getSupportedCurrencies(): Promise<string[]> {
    const rates = await this.currencyRateRepository.getAllRates();
    const currencies = new Set<string>();
    
    for (const rate of rates) {
      currencies.add(rate.from);
      currencies.add(rate.to);
    }

    return Array.from(currencies).sort();
  }

  async getAvailableRates(): Promise<{ from: string; to: string; rate: number; lastUpdated: Date }[]> {
    const rates = await this.currencyRateRepository.getAllRates();
    return rates.map(rate => ({
      from: rate.from,
      to: rate.to,
      rate: Math.round(rate.rate * 10000) / 10000,
      lastUpdated: rate.lastUpdated,
    }));
  }
}