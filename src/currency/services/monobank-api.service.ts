import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { MonobankCurrencyRate } from '../../shared/interfaces/currency.interface';
import { MonobankApiException } from '../../shared/exceptions/currency.exceptions';


@Injectable()
export class MonobankApiService {
  private readonly logger = new Logger(MonobankApiService.name);
  private readonly apiUrl: string;
  private readonly retryAttempts: number;
  private readonly retryDelay: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('MONOBANK_API_URL', 'https://api.monobank.ua/bank/currency');
    this.retryAttempts = this.configService.get<number>('RETRY_ATTEMPTS', 3);
    this.retryDelay = this.configService.get<number>('RETRY_DELAY', 1000);
  }

  async fetchExchangeRates(): Promise<MonobankCurrencyRate[]> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        this.logger.log(`Fetching exchange rates from Monobank API (attempt ${attempt})`);
        
        const response = await firstValueFrom(
          this.httpService.get<MonobankCurrencyRate[]>(this.apiUrl, {
            timeout: 10000,
            headers: {
              'User-Agent': 'Currency-Converter/1.0',
            },
          })
        );

        return response.data;

      } catch (error) {
        lastError = error;
        this.logger.error(`Attempt ${attempt} failed: ${error.message}`);

        if (attempt < this.retryAttempts) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          this.logger.log(`Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    const errorMessage = this.getErrorMessage(lastError);
    this.logger.error(`All ${this.retryAttempts} attempts failed. Last error: ${errorMessage}`);
    throw new MonobankApiException(errorMessage);
  }

  private getErrorMessage(error: Error): string {
    if (error instanceof AxiosError) {
      if (error.code === 'ECONNABORTED') {
        return 'Request timeout';
      }
      if (error.response) {
        return `HTTP ${error.response.status}: ${error.response.statusText}`;
      }
      if (error.request) {
        return 'No response received from server';
      }
    }
    return error.message || 'Unknown error';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}