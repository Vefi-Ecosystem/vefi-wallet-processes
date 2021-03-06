import { createClient, RedisClientType } from 'redis';
import logger from '../logger';

class RedisConnector {
  clientInstance: RedisClientType<any, Record<string, any>>;

  constructor() {
    this.clientInstance = createClient();
  }

  async _connect() {
    this.clientInstance.on('error', logger);
    await this.clientInstance.connect();
    logger('Connection to Redis initialized');
  }

  setJsonVal(key: string, field: string, val: object, expiresIn: number = 0): Promise<number> {
    return new Promise((resolve, reject) => {
      this.clientInstance
        .hSet(key, field, JSON.stringify(val))
        .then((_val) => {
          if (expiresIn > 0)
            (async () => {
              await this.clientInstance.expire(key, expiresIn * 60);
            })();

          resolve(_val);
        })
        .catch(reject);
    });
  }

  simpleSet(key: string, val: string | number, expiresIn: number = 0): Promise<string | null> {
    return new Promise((resolve, reject) => {
      this.clientInstance
        .set(key, val)
        .then((_val) => {
          if (expiresIn > 0)
            (async () => {
              await this.clientInstance.expire(key, expiresIn * 60);
            })();

          resolve(_val);
        })
        .catch(reject);
    });
  }

  getJsonVal(key: string): Promise<{ [x: string]: string }> {
    return this.clientInstance.hGetAll(key);
  }

  simpleGet(key: string): Promise<string | null> {
    return this.clientInstance.get(key);
  }

  exists(key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.clientInstance
        .exists(key)
        .then((_val) => {
          if (_val === 1) resolve(true);
          else resolve(false);
        })
        .catch(reject);
    });
  }
}

const redis = new RedisConnector();

export default redis;
