import cron from 'node-cron';
import * as funcs from './functions';

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
}
