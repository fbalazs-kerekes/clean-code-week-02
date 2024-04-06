import { CurrencyFetchError } from "./errors/currencyFetchError";
import { IExchangeRateService } from "./exchangeRateService";

export class CurrencyConverter {
    private readonly FIXED_AMOUNT = 100;

    constructor(private exchangeRateService: IExchangeRateService) { }

    public Convert(amount: number, fromCurrency: string, toCurrency: string): number {
        try {
            this.validateAmount(amount);
            const exchangeRate = this.getExchangeRate(fromCurrency, toCurrency);
            this.validateExchangeRate(exchangeRate);
            return amount * exchangeRate;
        } catch (e) {
            let error = e as Error;
            throw new CurrencyFetchError((error as Error).message, error);
        }        
    }

    public GenerateConversionReport(fromCurrency: string, toCurrency: string, startDate: Date, endDate: Date): string {
        const conversions: number[] = [];
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            try {
                const exchangeRate = this.exchangeRateService.getExchangeRate(fromCurrency, toCurrency);
                this.validateExchangeRate(exchangeRate);
                this.calculateConversion(exchangeRate, conversions, currentDate);
            } catch (e) {
                let error = e as Error;
                throw new CurrencyFetchError((error as Error).message, error);
            }
        }

        return `Conversion Report:\n${conversions.join('\n')}`;
    }

    private getExchangeRate(fromCurrency: string, toCurrency: string) {
        return this.exchangeRateService.getExchangeRate(fromCurrency, toCurrency);
    }

    private calculateConversion(exchangeRate: number, conversions: number[], currentDate: Date) {
        const convertedAmount = this.FIXED_AMOUNT * exchangeRate; // Assume a fixed amount for simplicity
        conversions.push(convertedAmount);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    private validateExchangeRate(exchangeRate: number) {
        if (!exchangeRate) {
            throw new Error('Unable to fetch exchange rate.');
        }

        if (isNaN(exchangeRate)) {
            throw new Error('Invalid exchange rate.');
        }
    }

    private validateAmount(amount: number) {
        if (isNaN(amount)) {
            throw new Error('Invalid amount input.');
        }
    }
}