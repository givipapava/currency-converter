import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CurrencyController } from '../controllers/currency.controller';
import { CurrencyConversionService } from './services/currency-conversion.service';
import { MonobankApiService } from './services/monobank-api.service';
import { CacheService } from './services/cache.service';
import { CurrencyRateRepository } from './repositories/currency-rate.repository';
import { DirectConversionStrategy } from './strategies/direct-conversion.strategy';
import { CrossConversionStrategy } from './strategies/cross-conversion.strategy';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  controllers: [CurrencyController],
  providers: [
    CurrencyConversionService,
    MonobankApiService,
    CacheService,
    CurrencyRateRepository,
    DirectConversionStrategy,
    CrossConversionStrategy,
  ],
  exports: [CurrencyConversionService],
})
export class CurrencyModule {}