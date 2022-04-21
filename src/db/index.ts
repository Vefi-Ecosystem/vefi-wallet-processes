import { Sequelize } from 'sequelize';
import modelsDef from './models';
import { dbHost, dbPort, dbPass, dbName, dbUser } from '../env';

export const sequelize = new Sequelize({
  host: dbHost,
  port: parseInt(dbPort || '5432'),
  username: dbUser,
  password: dbPass,
  database: dbName,
  dialect: 'postgres',
  sync: {
    force: false
  }
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
