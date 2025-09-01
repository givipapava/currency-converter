export const CURRENCY_CODES: Record<number, string> = {
  840: 'USD',
  978: 'EUR',
  826: 'GBP',
  392: 'JPY',
  756: 'CHF',
  124: 'CAD',
  36: 'AUD',
  752: 'SEK',
  578: 'NOK',
  208: 'DKK',
  985: 'PLN',
  203: 'CZK',
  348: 'HUF',
  980: 'UAH',
  643: 'RUB',
  946: 'RON',
  975: 'BGN',
  191: 'HRK',
  949: 'TRY',
};

export const SUPPORTED_CURRENCIES: Record<string, number> = Object.entries(
  CURRENCY_CODES,
).reduce((acc, [code, currency]) => {
  acc[currency] = parseInt(code, 10);
  return acc;
}, {} as Record<string, number>);