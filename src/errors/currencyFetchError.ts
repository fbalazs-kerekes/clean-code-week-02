export class CurrencyFetchError extends Error {
    public constructor(message: string, public error?: Error) {
        super(message);
        this.name = this.constructor.name;
    }
}