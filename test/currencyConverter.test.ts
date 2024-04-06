import { mock, mockReset } from 'jest-mock-extended';
import { IExchangeRateService } from '../src/exchangeRateService';
import { CurrencyConverter } from '../src/currencyConverter';
import { CurrencyFetchError } from '../src/errors/currencyFetchError';

const mockExchangeRateService = mock<IExchangeRateService>();

describe('CurrencyConverter tests', () => {
    const fromCurrency = 'EUR';
    const toCurrency = 'HUF';
    const amount = 1;
    const exchangeRate = 1;
    const reportStartDate = new Date('2024-01-01');
    const reportEndDate = new Date('2024-01-05');
    const expectedExchangeRateErrorMessage = 'Unable to fetch exchange rate.';
    const expectedAmountErrorMessage = 'Invalid amount input.';
    const expectedExchangeRateError = new CurrencyFetchError(expectedExchangeRateErrorMessage);
    const expectedAmountError = new CurrencyFetchError(expectedAmountErrorMessage);
    let currencyConverter: CurrencyConverter;

    beforeEach(() => {
        mockReset(mockExchangeRateService);
        currencyConverter = new CurrencyConverter(mockExchangeRateService);
    })

    describe('Convert tests', () => {
        describe('Happy path', () => {
            it.each([
                ['EUR', 'HUF', 1.0, 392, 392.0],
                ['HUF', 'EUR', 392.0, 0.00255, 1.0],
            ])('should convert currency %s to %s', (fromCurrency: string, toCurrency: string, amount: number, exchangeRate: number, expectedCovertedAmount: number) => {
                mockExchangeRateService.getExchangeRate.mockReturnValue(exchangeRate);
                
                let convertedAmount = Math.round(currencyConverter.Convert(amount, fromCurrency, toCurrency) * 100) / 100;
                
                expect(convertedAmount).toEqual(expectedCovertedAmount);
                expect(mockExchangeRateService.getExchangeRate).toHaveBeenCalledTimes(1);
            })
        })

        describe('Error path', () => {
            it('should throw and error when amount is not a number', () => {
                const amountNaN = NaN;

                mockExchangeRateService.getExchangeRate.mockReturnValue(exchangeRate);

                expect(() => currencyConverter.Convert(amountNaN, fromCurrency, toCurrency)).toThrow(expectedAmountError);
                expect(mockExchangeRateService.getExchangeRate).toHaveBeenCalledTimes(0);
            })

            it('should throw an Error when exchange rate is 0', () => {
                const exchangeRateReturnValue = 0;

                mockExchangeRateService.getExchangeRate.mockReturnValue(exchangeRateReturnValue);
                expect(() => currencyConverter.Convert(amount, fromCurrency, toCurrency)).toThrow(expectedExchangeRateError);
                expect(mockExchangeRateService.getExchangeRate).toHaveBeenCalledTimes(1);
            })


            it('should throw an Error when exchange rate is not a number', () => {
                const exchangeRateReturnValue = NaN;

                mockExchangeRateService.getExchangeRate.mockReturnValue(exchangeRateReturnValue);
                const sut = () => currencyConverter.Convert(amount, fromCurrency, toCurrency);
                expect(sut).toThrow(CurrencyFetchError);
                expect(sut).toThrow(expectedExchangeRateError);
                expect(mockExchangeRateService.getExchangeRate).toHaveBeenCalledTimes(2);
            })
        })
    })

    describe('GenerateConversionReport tests', () => {
        describe('Happy path', () => {
            it.each([
                ['EUR', 'HUF', new Date('2024-01-01'), new Date('2024-01-05'), [1, 0.99, 0.98, 1, 1]],
                ['HUF', 'EUR', new Date('2024-01-01'), new Date('2024-01-05'), [0.04, 0.02, 0.01, 0.05, 0.08]],
            ])('should generate conversion report for %s to %s between %s and %s', (fromCurrency: string, toCurrency: string, startDate: Date, endDate: Date, conversionRates: number[]) => {
                conversionRates.every((value) => mockExchangeRateService.getExchangeRate.mockReturnValueOnce(value));
                
                let conversionReport = currencyConverter.GenerateConversionReport(fromCurrency, toCurrency, startDate, endDate);

                expect(conversionReport).toMatchSnapshot();
                expect(mockExchangeRateService.getExchangeRate).toHaveBeenCalledTimes(5);
            })
        })

        describe('Error path', () => {
            it('should throw and error when exchange rate is not a number', () => {
                const exchangeRateNaN = NaN;

                mockExchangeRateService.getExchangeRate.mockReturnValue(exchangeRateNaN);

                const sut = () => currencyConverter.GenerateConversionReport(fromCurrency, toCurrency, reportStartDate, reportEndDate);
                expect(sut).toThrow(CurrencyFetchError);
                expect(sut).toThrow(expectedExchangeRateError);

                expect(mockExchangeRateService.getExchangeRate).toHaveBeenCalledTimes(2);
            })
        })
    })
})