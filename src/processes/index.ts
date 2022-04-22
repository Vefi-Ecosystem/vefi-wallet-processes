import logger from '../logger';
import avaxProcess from './avalanche';
import bnbProcess from './binance';
import ethProcess from './ethereum';

export const _runProcesses = async () => {
  try {
    await Promise.all([
      avaxProcess.sync().then(() => avaxProcess.processBlocks()),
      bnbProcess.sync().then(() => bnbProcess.processBlocks()),
      ethProcess.sync().then(() => ethProcess.processBlocks())
    ]);
  } catch (error: any) {
    logger(error.message);
  }
};
