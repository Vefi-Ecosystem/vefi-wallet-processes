import Account from './account';
import Wallet from './wallet';
import type { Sequelize } from 'sequelize';

export default (s: Sequelize) => {
  return {
    account: new Account(s),
    wallet: new Wallet(s)
  };
};
