import { IsString, IsPositive, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CurrencyConversionDto {
  @IsString()
  @Matches(/^[A-Z]{3}$/, { message: 'Invalid currency code' })
  from: string;

  @IsString()
  @Matches(/^[A-Z]{3}$/, { message: 'Invalid currency code' })
  to: string;

  @IsPositive({ message: 'Amount must be positive' })
  @Transform(({ value }) => parseFloat(value))
  amount: number;
}