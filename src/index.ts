import express from 'express';
import logger from './logger';
import { port as PORT } from './env';
import { _fetchAssetList, _fetchCoinPrices } from './functions';

const port: number = parseInt(PORT || '15500');
const app: express.Express = express();

app.listen(port, () => {
  logger('Server running on port %d', port);
  (async () => {
    await _fetchAssetList();
    await _fetchCoinPrices();
  })();
});
