import { BelongsTo, BelongsToOptions, DataTypes, FindOptions, Model, ModelStatic, Sequelize } from 'sequelize';
import Base from './base';

export default class Wallet extends Base {
  private model: ModelStatic<Model<any, any>>;

  constructor(s: Sequelize) {
    super();
    this.model = this._defineModel(s, 'Wallet', {
      id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Address must not be empty'
          }
        }
      }
    });
  }

  create(val: any): Promise<Model<any, any>> {
    return super.create(this.model, val);
  }

  findAll(): Promise<Model<any, any>[]> {
    return super.findAll(this.model);
  }

  findOne(opts: FindOptions<any> | undefined): Promise<Model<any, any> | null> {
    return super.find(this.model, opts);
  }

  belongs(
    model: ModelStatic<Model<any, any>>,
    opts?: BelongsToOptions | undefined
  ): BelongsTo<Model<any, any>, Model<any, any>> {
    return super.belongsTo(this.model, model, opts);
  }
}
