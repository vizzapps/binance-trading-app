import fs from 'fs';
import { getVerifyCredential, limitSellOrder, loadBalances, marketBuyOrder, stopLossLimitSellOrder } from './api';
import path from 'path';

const assets = path.join(window.applicationPath, '../assets/');

export const getSaveCredential = (apiKey, secretKey) => {
  return new Promise((resolve, reject) => {
    const credential = {
      "apiKey": apiKey,
      "secretKey": secretKey
    };
    const data = JSON.stringify(credential);
    fs.writeFile(`${assets}credential.json`, data, (err) => {
      if (err){
        reject(err);
        return;
      }
      resolve(true);
    })
  })
};

export const getCredential = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(`${assets}credential.json`, function(err, data) {
      if (err) {
        reject(err);
        return;
      }
      try {
        const credential = JSON.parse(data);
        resolve(credential);
      }catch(ex){
        reject(ex);
      }
    });
  });
};

export const checkCredential = async () => {
  const credential = await getCredential();
  if (credential.apiKey && credential.secretKey){
    const checkResult = await getVerifyCredential(credential.apiKey, credential.secretKey);
    return !!checkResult.data.updateTime;
  }
  return false;
};

export const getCurrent = () => {
  const currentDate = new Date();
  const timestamp = currentDate.getTime();
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = "0" + date.getMinutes();
  const seconds = "0" + date.getSeconds();
  return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
};

export const getBalances = async () => {
  const credential = await getCredential();
  return await loadBalances(credential.apiKey, credential.secretKey);
};

export const buyOrder = async (p) => {
  const params = p;
  const credential = await getCredential();
  params.apiKey = credential.apiKey;
  params.secretKey = credential.secretKey;

  return await marketBuyOrder(params)
};

export const sendOrder1 = async (p) => {
  const params = p;
  const credential = await getCredential();
  params.apiKey = credential.apiKey;
  params.secretKey = credential.secretKey;
  return await limitSellOrder(params)
};

export const sendOrder2 = async (p) => {
  const params = p;
  const credential = await getCredential();
  params.apiKey = credential.apiKey;
  params.secretKey = credential.secretKey;
  return await stopLossLimitSellOrder(params)
};

export const convert = (c) => {
  return c.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
};
