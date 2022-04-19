import cron from 'node-cron';
import redis from './helpers/redis';
import logger from './logger';
import { assetsUrl, coinAPIRoot, coinAPIKey } from './env';
import { _apiRequest } from './utils';
import * as CONSTANTS from './constants';

export default class CronService {
  static _fetchCoinPrices() {
    cron
      .schedule('*/30 * * * * *', async () => {
        try {
          const _exists = await redis.exists(CONSTANTS.REDIS_COINLIST_KEY);

          if (_exists) {
            const _redisResult = await redis.simpleGet(CONSTANTS.REDIS_COINLIST_KEY);
            const _symbolList = JSON.parse(_redisResult as string).map((coin: any) => coin.symbol);

            let record: any = new Map<string, { rate: number; percentageChange: number }>();
            let i = 1;

            for (const symbol of _symbolList) {
              try {
                setTimeout(() => {
                  logger('Iteration for Coin API request: %d', i);
                }, 30000);
                const priceResponse = await _apiRequest(
                  `${coinAPIRoot}/v1/exchangerate/${symbol.toUpperCase()}/USD`,
                  { method: 'GET', headers: { 'X-CoinAPI-Key': <string>coinAPIKey } },
                  'json'
                );
                record.set(symbol, { rate: priceResponse.rate, percentageChange: 0 });
                i = i + 1;
              } catch (error: any) {
                logger(error.message);
              }
            }

            record = Object.fromEntries(record);

            const _result = await redis.simpleSet(CONSTANTS.REDIS_PRICES_KEY, JSON.stringify(record));
            logger('Redis response: %s', _result);
          }
        } catch (error: any) {
          logger(error.message);
        }
      })
      .start();
  }
}
