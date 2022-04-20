import { Sequelize } from 'sequelize';
import modelsDef from './models';
import { dbHost, dbPort, dbPass } from '../env';
import logger from '../logger';

export const sequelize = new Sequelize({
  host: dbHost,
  port: parseInt(dbPort || '5432'),
  password: dbPass,
  dialect: 'postgres',
  sync: {
    force: false
  },
  logging: logger
});

export const models = modelsDef(sequelize);

(() => {
  models.wallet.belongs(models.account.model, {
    as: 'account'
  });
  models.push.belongs(models.account.model, {
    as: 'account'
  });
  models.tx.belongs(models.account.model, {
    as: 'account'
  });
})();
