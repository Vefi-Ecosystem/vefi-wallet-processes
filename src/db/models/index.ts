import Account from './account';
import Wallet from './wallet';
import PushSubscription from './push_subscription';
import Transaction from './transaction';
import type { Sequelize } from 'sequelize';

export default (s: Sequelize) => {
  return {
    account: new Account(s),
    wallet: new Wallet(s),
    push: new PushSubscription(s),
    tx: new Transaction(s)
  };
};
