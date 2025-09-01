import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CurrencyRate } from '../../shared/interfaces/currency.interface';
import { CacheException } from '../../shared/exceptions/currency.exceptions';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly redis: Redis;
  private readonly cacheTtl: number;

  constructor(private readonly configService: ConfigService) {
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    this.cacheTtl = this.configService.get<number>('CACHE_TTL', 300000);

    this.redis = new Redis({
      host: redisHost,
      port: redisPort,
      maxRetriesPerRequest: 3,
    });

    this.redis.on('connect', () => {
      this.logger.log('Connected to Redis');
    });

    this.redis.on('error', (error) => {
      this.logger.error(`Redis connection error: ${error.message}`);
    });
  }

  async getCurrencyRates(): Promise<CurrencyRate[] | null> {
    try {
      const cached = await this.redis.get('currency_rates');
      if (cached) {
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      this.logger.error(`Error retrieving from cache: ${error.message}`);
      throw new CacheException(`Failed to retrieve from cache: ${error.message}`);
    }
  }

  async setCurrencyRates(rates: CurrencyRate[]): Promise<void> {
    try {
      await this.redis.setex(
        'currency_rates',
        Math.floor(this.cacheTtl / 1000),
        JSON.stringify(rates)
      );
    } catch (error) {
      this.logger.error(`Error setting cache: ${error.message}`);
      throw new CacheException(`Failed to set cache: ${error.message}`);
    }
  }

  async getCurrencyRate(from: string, to: string): Promise<CurrencyRate | null> {
    try {
      const key = `rate_${from}_${to}`;
      const cached = await this.redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      this.logger.error(`Error retrieving rate from cache: ${error.message}`);
      return null;
    }
  }

  async setCurrencyRate(rate: CurrencyRate): Promise<void> {
    try {
      const key = `rate_${rate.from}_${rate.to}`;
      await this.redis.setex(
        key,
        Math.floor(this.cacheTtl / 1000),
        JSON.stringify(rate)
      );
    } catch (error) {
      this.logger.error(`Error setting rate cache: ${error.message}`);
    }
  }

  async invalidateCache(): Promise<void> {
    try {
      const keys = await this.redis.keys('currency_rates');
      const rateKeys = await this.redis.keys('rate_*');
      const allKeys = [...keys, ...rateKeys];
      
      if (allKeys.length > 0) {
        await this.redis.del(...allKeys);
        this.logger.log(`Invalidated ${allKeys.length} cache entries`);
      }
    } catch (error) {
      this.logger.error(`Error invalidating cache: ${error.message}`);
      throw new CacheException(`Failed to invalidate cache: ${error.message}`);
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch {
      return false;
    }
  }

  onModuleDestroy() {
    this.redis.disconnect();
    this.logger.log('Disconnected from Redis');
  }
}