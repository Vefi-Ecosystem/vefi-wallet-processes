import { Sequelize } from 'sequelize';
import modelsDef from './models';

export const sequelize = new Sequelize();

export const models = modelsDef(sequelize);
