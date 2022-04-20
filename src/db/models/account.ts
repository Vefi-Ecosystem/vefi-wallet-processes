import { DataTypes, FindOptions, Model, ModelStatic, Sequelize } from 'sequelize';
import Base from './base';

export default class Account extends Base {
  public model: ModelStatic<Model<any, any>>;

  constructor(s: Sequelize) {
    super();
    this.model = this._defineModel(s, 'Account', {
      id: {
        primaryKey: true,
        type: DataTypes.STRING, // Hash of mnemonic or seed
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Identifier required'
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

  findByPk(pk: string): Promise<Model<any, any> | null> {
    return super.findByKey(this.model, pk);
  }
}
