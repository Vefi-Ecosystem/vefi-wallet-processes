import {
  BelongsTo,
  BelongsToOptions,
  DataTypes,
  DestroyOptions,
  FindOptions,
  Model,
  ModelStatic,
  Sequelize,
  UpdateOptions
} from 'sequelize';
import Base from './base';

export default class PushSubscription extends Base {
  private model: ModelStatic<Model<any, any>>;

  constructor(s: Sequelize) {
    super();
    this.model = this._defineModel(s, 'Notification', {
      id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Push token is required'
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

  update(val: any, opts: UpdateOptions<any>): Promise<number> {
    return super.update(this.model, val, opts);
  }

  remove(opts?: DestroyOptions): Promise<number> {
    return super.delete(this.model, opts);
  }

  belongs(
    model: ModelStatic<Model<any, any>>,
    opts?: BelongsToOptions | undefined
  ): BelongsTo<Model<any, any>, Model<any, any>> {
    return super.belongsTo(this.model, model, opts);
  }
}
