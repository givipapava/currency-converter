import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CurrencyModule } from './currency/currency.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthController } from './controllers/health.controller';
import { CacheService } from './currency/services/cache.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    CurrencyModule,
  ],
  controllers: [HealthController],
  providers: [CacheService],
})
export class AppModule {}