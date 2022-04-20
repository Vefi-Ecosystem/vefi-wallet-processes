import { assetsUrl, coinAPIKey, coinAPIRoot } from './env';
import redis from './helpers/redis';
import logger from './logger';
import { _apiRequest } from './utils';
import networks from './networks.json';
import * as CONSTANTS from './constants';

export const _fetchAssetList = async () => {
  try {
    let coinsList: Array<any> = [];
    const blockchainsResponse = await _apiRequest(
      `${assetsUrl}/assets/list`,
      { method: 'GET', headers: { Accepts: 'application/json' } },
      'json'
    );

    for (const blockchain of blockchainsResponse.result) {
      const blockchainInfo = await _apiRequest(
        `${assetsUrl}/assets/${blockchain}/info`,
        { method: 'GET', headers: { Accepts: 'application/json' } },
        'json'
      );
      coinsList = [...coinsList, blockchainInfo.result];

      if (networks.value.includes(blockchain)) {
        const assetsAddressesResponse = await _apiRequest(
          `${assetsUrl}/assets/tokens/${blockchain}/addresses`,
          { method: 'GET', headers: { Accepts: 'application/json' } },
          'json'
        );

        for (const address of assetsAddressesResponse.result) {
          const assetInfo = await _apiRequest(
            `${assetsUrl}/assets/tokens/${blockchain}/${address}/info`,
            { method: 'GET', headers: { Accepts: 'application/json' } },
            'json'
          );
          coinsList = [...coinsList, assetInfo.result];
        }
      }
    }
    const _result = await redis.simpleSet(CONSTANTS.REDIS_COINLIST_KEY, JSON.stringify(coinsList));

    logger('Redis response: %s', _result);
  } catch (error: any) {
    logger(error.message);
  }
};

export const _fetchCoinPrices = async () => {
  try {
    const _coinlistKeyExists = await redis.exists(CONSTANTS.REDIS_COINLIST_KEY);

    if (_coinlistKeyExists) {
      const _redisResult = await redis.simpleGet(CONSTANTS.REDIS_COINLIST_KEY);
      const _symbolList = JSON.parse(_redisResult as string).map((coin: any) => coin.symbol);

      const record: Map<string, { rate: number; percentageChange: number }> = new Map<
        string,
        { rate: number; percentageChange: number }
      >();

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
          const historicalPriceResponse = await _apiRequest(
            `${coinAPIRoot}/v1/exchangerate/${symbol.toUpperCase()}/USD/history?period_id=1HRS&time_end=${new Date(
              Date.now()
            ).toISOString()}&limit=1`,
            { method: 'GET', headers: { Accepts: 'application/json' } },
            'json'
          );
          const percentageChange =
            ((priceResponse.rate - historicalPriceResponse[0].rate_close) / priceResponse.rate) * 100;
          record.set(symbol, { rate: priceResponse.rate, percentageChange });
          i = i + 1;
        } catch (error: any) {
          logger(error.message);
          record.set(symbol, { rate: 0, percentageChange: 0 });
        }
      }

      const json = Object.fromEntries(record);
      const _result = await redis.simpleSet(CONSTANTS.REDIS_PRICES_KEY, JSON.stringify(json));

      logger('Redis response: %s', _result);
    }
  } catch (error: any) {
    logger(error.message);
  }
};
