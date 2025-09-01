import { Injectable, Logger } from '@nestjs/common';
import { ConversionStrategy } from '../interfaces/conversion-strategy.interface';
import { CurrencyRate } from '../../shared/interfaces/currency.interface';

@Injectable()
export class CrossConversionStrategy implements ConversionStrategy {
  private readonly logger = new Logger(CrossConversionStrategy.name);
  private readonly baseCurrency = 'UAH';

  canHandle(from: string, to: string, rates: CurrencyRate[]): boolean {
    const fromToBase = rates.some(rate => rate.from === from && rate.to === this.baseCurrency);
    const baseToTarget = rates.some(rate => rate.from === this.baseCurrency && rate.to === to);
    
    return fromToBase && baseToTarget;
  }

  async convert(
    amount: number,
    from: string,
    to: string,
    rates: CurrencyRate[]
  ): Promise<{ convertedAmount: number; rate: number; path?: string[] }> {
    const fromToBaseRate = rates.find(r => r.from === from && r.to === this.baseCurrency);
    if (!fromToBaseRate) {
      throw new Error(`Cannot find rate from ${from} to ${this.baseCurrency}`);
    }

    const baseToTargetRate = rates.find(r => r.from === this.baseCurrency && r.to === to);
    if (!baseToTargetRate) {
      throw new Error(`Cannot find rate from ${this.baseCurrency} to ${to}`);
    }

    const effectiveRate = fromToBaseRate.rate * baseToTargetRate.rate;
    const convertedAmount = amount * effectiveRate;

    this.logger.log(
      `Cross-currency conversion: ${amount} ${from} -> ${amount * fromToBaseRate.rate} ${this.baseCurrency} -> ${convertedAmount} ${to}`
    );

    return {
      convertedAmount,
      rate: effectiveRate,
      path: [from, this.baseCurrency, to],
    };
  }
}