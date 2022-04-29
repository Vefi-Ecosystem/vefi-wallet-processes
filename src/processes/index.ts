import logger from '../logger';
import avaxProcess from './avalanche';
import bnbProcess from './binance';
import briseProcess from './bitgert';
import ethProcess from './ethereum';
import solProcess from './solana';

export const _runProcesses = async () => {
  try {
    await Promise.all([
      avaxProcess.sync().then(() => avaxProcess.processBlocks()),
      bnbProcess.sync().then(() => bnbProcess.processBlocks()),
      briseProcess.sync().then(() => briseProcess.processBlocks()),
      ethProcess.sync().then(() => ethProcess.processBlocks()),
      solProcess.sync().then(() => solProcess.processBlocks())
    ]);
  } catch (error: any) {
    logger(error.message);
  }
};
