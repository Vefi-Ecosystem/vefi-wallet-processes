import Web3 from 'web3';
import * as db from '../db';
import { ETH_WS_URL } from '../env';

class EthereumProcess {
  web3: Web3;
  latency: number;
  constructor(latency: number = 10) {
    const provider = new Web3.providers.WebsocketProvider(<string>ETH_WS_URL, {
      clientConfig: {
        maxReceivedFrameSize: 100000000,
        maxReceivedMessageSize: 100000000,
        keepalive: true,
        keepaliveInterval: 1600000
      },
      reconnect: {
        auto: true,
        delay: 5000,
        maxAttempts: 5,
        onTimeout: false
      }
    });
    this.web3 = new Web3(provider);
    this.latency = latency;
  }
}
