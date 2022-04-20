import type {
  BelongsTo,
  BelongsToOptions,
  FindOptions,
  Model,
  ModelAttributes,
  ModelStatic,
  Sequelize,
  UpdateOptions
} from 'sequelize';

export default abstract class Base {
  protected _defineModel(
    sequelize: Sequelize,
    modelName: string,
    def: ModelAttributes<Model<any, any>, any>
  ): ModelStatic<Model<any, any>> {
    return sequelize.define(modelName, def);
  }

  create(model: ModelStatic<Model<any, any>>, val: any): Promise<Model<any, any>> {
    return new Promise((resolve, reject) => {
      model.create(val).then(resolve).catch(reject);
    });
  }

  find(model: ModelStatic<Model<any, any>>, opts?: FindOptions<any>): Promise<Model<any, any> | null> {
    return new Promise((resolve, reject) => {
      model.findOne(opts).then(resolve).catch(reject);
    });
  }

  findByKey(model: ModelStatic<Model<any, any>>, pk: string): Promise<Model<any, any> | null> {
    return new Promise((resolve, reject) => {
      model.findByPk(pk).then(resolve).catch(reject);
    });
  }

  findAll(model: ModelStatic<Model<any, any>>, opts?: FindOptions<any>): Promise<Model<any, any>[]> {
    return new Promise((resolve, reject) => {
      model.findAll().then(resolve).catch(reject);
    });
  }

  update(model: ModelStatic<Model<any, any>>, val: any, opts: UpdateOptions<any>): Promise<number> {
    return new Promise((resolve, reject) => {
      model
        .update(val, opts)
        .then(([count]) => resolve(count))
        .catch(reject);
    });
  }

  protected belongsTo(
    model1: ModelStatic<Model<any, any>>,
    model2: ModelStatic<Model<any, any>>,
    opts: BelongsToOptions | undefined
  ): BelongsTo<Model<any, any>, Model<any, any>> {
    return model1.belongsTo(model2, opts);
  }
}
