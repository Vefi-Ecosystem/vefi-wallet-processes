import { BelongsTo, BelongsToOptions, DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';
import Base from './base';

export default class Transaction extends Base {
  public model: ModelStatic<Model<any, any>>;

  constructor(s: Sequelize) {
    super();
    this.model = this._defineModel(s, 'Transaction', {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      from: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      to: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      timestamp: {
        type: DataTypes.NUMBER,
        allowNull: false
      },
      coin: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'FAILED'),
        allowNull: false,
        validate: {
          is: ['PENDING', 'CONFIRMED', 'FAILED']
        }
      },
      amount: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      }
    });
  }

  create(val: any): Promise<Model<any, any>> {
    return super.create(this.model, val);
  }

  findByAccount(accountId: string): Promise<Array<Model<any, any>>> {
    return super.findAll(this.model, { where: { accountId } });
  }

  updateByAccount(accountId: string, update: any): Promise<number> {
    return super.update(this.model, update, { where: { accountId } });
  }

  belongs(
    model: ModelStatic<Model<any, any>>,
    opts?: BelongsToOptions | undefined
  ): BelongsTo<Model<any, any>, Model<any, any>> {
    return super.belongsTo(this.model, model, opts);
  }
}
