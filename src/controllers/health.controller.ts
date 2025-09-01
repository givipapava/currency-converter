import { Controller, Get } from '@nestjs/common';
import { CacheService } from '../currency/services/cache.service';

@Controller('health')
export class HealthController {
  constructor(private readonly cacheService: CacheService) {}

  @Get()
  async checkHealth() {
    const redisHealthy = await this.cacheService.isHealthy();
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        redis: redisHealthy ? 'healthy' : 'unhealthy',
      },
    };
  }
}