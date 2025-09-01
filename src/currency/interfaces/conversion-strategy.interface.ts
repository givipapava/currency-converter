import { CurrencyRate } from '../../shared/interfaces/currency.interface';

export interface ConversionStrategy {
  convert(
    amount: number,
    from: string,
    to: string,
    rates: CurrencyRate[]
  ): Promise<{ convertedAmount: number; rate: number; path?: string[] }>;
  
  canHandle(from: string, to: string, rates: CurrencyRate[]): boolean;
}