import Account from './account';
import type { Sequelize } from 'sequelize';

export default (s: Sequelize) => {
  return {
    account: new Account(s)
  };
};
