import { Sequelize } from 'sequelize';
import modelsDef from './models';
import { dbHost, dbPort, dbPass } from '../env';

export const sequelize = new Sequelize({
  host: dbHost,
  port: parseInt(dbPort || '5432'),
  password: dbPass,
  dialect: 'postgres',
  define: {
    underscored: true
  },
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
})();
