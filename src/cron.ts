import cron from 'node-cron';
import * as funcs from './functions';
import logger from './logger';

export default class CronService {
  static _fetchAssets() {
    cron
      .schedule('* */1 * * * *', async () => {
        await funcs._fetchAssetList();
      })
      .start();
  }

  static _fetchCoinPrices() {
    cron
      .schedule('*/30 * * * *', async () => {
        await funcs._fetchCoinPrices();
      })
      .start();
  }

  static _retrievePricesFromStore(cb: (key: string, item: { [x: string]: any }) => void) {
    cron
      .schedule('*/2 * * * * *', async () => {
        await funcs._retrievePricesFromStore(cb);
      })
      .start();
  }

  static _initAllProcesses() {
    try {
      this._fetchAssets();
      this._fetchCoinPrices();
    } catch (error: any) {
      logger(error.message);
    }
  }
}
