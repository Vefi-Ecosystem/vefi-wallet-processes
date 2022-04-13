import cron from 'node-cron';
import redis from './helpers/redis';
import logger from './logger';
import { assetsUrl, coinGeckoAPIRoot } from './env';
import { _apiRequest } from './utils';

const _fetchAddresses = (network: string) =>
  _apiRequest(
    `${assetsUrl}/assets/tokens/${network}/addresses`,
    {
      method: 'GET',
      headers: { accepts: 'application/json' }
    },
    'json'
  );

class CronService {}
