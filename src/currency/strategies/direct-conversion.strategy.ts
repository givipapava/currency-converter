import { Injectable } from '@nestjs/common';
import { ConversionStrategy } from '../interfaces/conversion-strategy.interface';
import { CurrencyRate } from '../../shared/interfaces/currency.interface';

@Injectable()
export class DirectConversionStrategy implements ConversionStrategy {
  canHandle(from: string, to: string, rates: CurrencyRate[]): boolean {
    return rates.some(rate => rate.from === from && rate.to === to);
  }

  async convert(
    amount: number,
    from: string,
    to: string,
    rates: CurrencyRate[]
  ): Promise<{ convertedAmount: number; rate: number; path?: string[] }> {
    const rate = rates.find(r => r.from === from && r.to === to);
    
    if (!rate) {
      throw new Error(`Direct conversion rate not found for ${from} to ${to}`);
    }

    return {
      convertedAmount: amount * rate.rate,
      rate: rate.rate,
      path: [from, to],
    };
  }
}