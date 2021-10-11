import { BinanceInterval, BinancePair } from "./types";

export function isValidSubscription(subscriptionMessage: string): boolean {
    const keys = subscriptionMessage.split('@');
    const interval = keys[1].split('_')[1];

    return (
        Object.values(BinanceInterval).includes(interval as BinanceInterval) &&
        Object.values(BinancePair).includes(keys[0] as BinancePair)
    );
}