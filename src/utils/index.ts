import sb from 'satoshi-bitcoin-ts';
import { parseEther } from '@ethersproject/units';
import request, { RequestInit } from 'node-fetch';

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

export const _apiRequest = (url: string, init: RequestInit, expects: 'json' | 'text'): Promise<any> => {
  return new Promise((resolve, reject) => {
    request(url, init)
      .then((res) => {
        if (res.status >= 400) reject(new Error(`API responded with ${res.status}`));
        return res[expects];
      })
      .then(resolve)
      .catch(reject);
  });
};
