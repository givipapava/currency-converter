export interface MonobankCurrencyRate {
  currencyCodeA: number;
  currencyCodeB: number;
  date: number;
  rateBuy?: number;
  rateSell?: number;
  rateCross?: number;
}

export interface CurrencyRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: Date;
}

export interface CurrencyConversionRequest {
  from: string;
  to: string;
  amount: number;
}

export interface CurrencyConversionResponse {
  from: string;
  to: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  timestamp: Date;
}