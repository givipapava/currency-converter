import { Injectable, Logger } from '@nestjs/common';
import { MonobankCurrencyRate, CurrencyRate } from '../../shared/interfaces/currency.interface';
import { CURRENCY_CODES } from '../../shared/constants/currency-codes';
import { MonobankApiService } from '../services/monobank-api.service';
import { CacheService } from '../services/cache.service';

@Injectable()
export class CurrencyRateRepository {
  private readonly logger = new Logger(CurrencyRateRepository.name);

  constructor(
    private readonly monobankApiService: MonobankApiService,
    private readonly cacheService: CacheService,
  ) {}

  async getAllRates(): Promise<CurrencyRate[]> {
    const cachedRates = await this.cacheService.getCurrencyRates();
    if (cachedRates) {
      return cachedRates;
    }

    const monobankRates = await this.monobankApiService.fetchExchangeRates();
    const currencyRates = this.transformMonobankRates(monobankRates);

    await this.cacheService.setCurrencyRates(currencyRates);

    return currencyRates;
  }

  async getRate(from: string, to: string): Promise<CurrencyRate | null> {
    const cachedRate = await this.cacheService.getCurrencyRate(from, to);
    if (cachedRate) {
      return cachedRate;
    }

    const allRates = await this.getAllRates();
    
    const rate = allRates.find(r => r.from === from && r.to === to);
    
    if (rate) {
      await this.cacheService.setCurrencyRate(rate);
    }

    return rate || null;
  }

  private transformMonobankRates(monobankRates: MonobankCurrencyRate[]): CurrencyRate[] {
    const rates: CurrencyRate[] = [];
    const now = new Date();

    rates.push({
      from: 'UAH',
      to: 'UAH',
      rate: 1,
      lastUpdated: now,
    });

    for (const monobankRate of monobankRates) {
      const fromCurrency = CURRENCY_CODES[monobankRate.currencyCodeA];
      const toCurrency = CURRENCY_CODES[monobankRate.currencyCodeB];

      if (!fromCurrency || !toCurrency) {
        this.logger.warn(
          `Unknown currency codes: ${monobankRate.currencyCodeA} or ${monobankRate.currencyCodeB}`
        );
        continue;
      }

      const date = new Date(monobankRate.date * 1000);

      if (toCurrency === 'UAH') {
        if (monobankRate.rateBuy) {
          rates.push({
            from: 'UAH',
            to: fromCurrency,
            rate: 1 / monobankRate.rateBuy,
            lastUpdated: date,
          });
        }

        if (monobankRate.rateSell) {
          rates.push({
            from: fromCurrency,
            to: 'UAH',
            rate: monobankRate.rateSell,
            lastUpdated: date,
          });
        }
      }

      if (monobankRate.rateCross) {
        rates.push({
          from: fromCurrency,
          to: toCurrency,
          rate: monobankRate.rateCross,
          lastUpdated: date,
        });

        rates.push({
          from: toCurrency,
          to: fromCurrency,
          rate: 1 / monobankRate.rateCross,
          lastUpdated: date,
        });
      }
    }

    this.logger.log(`Transformed ${monobankRates.length} Monobank rates to ${rates.length} currency rates`);
    return rates;
  }

  async invalidateCache(): Promise<void> {
    await this.cacheService.invalidateCache();
  }
}