import express from 'express';
import http from 'http';
import logger from './logger';
import { port as PORT } from './env';
import { _fetchAssetList, _fetchCoinPrices } from './functions';
import _config from './config';
import { sequelize } from './db';
import CronService from './cron';
import SocketService from './socket';
import { _runProcesses } from './processes';
import redis from './helpers/redis';

const port: number = parseInt(PORT || '15500');
const app: express.Express = express();

_config(app);

const server = http.createServer(app);

function _initAllProcesses() {
  SocketService._init(server);
  redis._connect().then(() => {
    CronService._initAllProcesses();
    _runProcesses().then(() => {
      CronService._retrievePricesFromStore(SocketService._emitToAll);
    });
  });
}

server.listen(port, () => {
  logger('Server running on port %d', port);
  (() => {
    sequelize.sync().then(() => {
      _fetchAssetList().then(() => {
        _fetchCoinPrices().then(() => {
          _initAllProcesses();
          logger('Sync and init all processes');
        });
      });
    });
  })();
});
