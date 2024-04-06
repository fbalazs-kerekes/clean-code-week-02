export interface IExchangeRateService {
    getExchangeRate(fromCurrency: string, toCurrency: string): number;
}