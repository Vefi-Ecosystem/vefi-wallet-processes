import sb from 'satoshi-bitcoin-ts';
import { parseEther } from '@ethersproject/units';
import request from 'node-fetch';

export const _bitcoinToSat = (bit: number | string): number => sb.toSatoshi(bit);
export const _satToBitcoin = (sat: number | string): number => sb.toBitcoin(sat);
export const _toEther = (val: string) => parseEther(val).toString();
export const _toWei = (val: number) => val * Math.pow(10, 18);
export const _toDec = (val: number, pow: number) => val * Math.pow(10, pow);

interface JsonRpcRequestParams {
  jsonrpc: '2.0';
  id?: number | string;
  method: string;
  params: Array<any>;
}

export const _rpcRequest = (url: string, params: JsonRpcRequestParams) => {
  return new Promise<any>((resolve, reject) => {
    request(url, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: { 'content-type': 'application/json' }
    })
      .then((res) => {
        if (res.status >= 400) reject(new Error(`Server responded with ${res.status}`));
        else return res.json();
      })
      .then((res: any) => {
        if (!!res.error && !res.result) reject(new Error(res.error.message || res.error));
        else resolve(res.result);
      })
      .catch(reject);
  });
};
