import axios from 'axios';

export const getVerifyCredential = (apiKey, secretKey) => {
  return axios.get('http://localhost:3000/verify', {
    params: {
      apiKey: apiKey,
      secretKey: secretKey
    }
  });
};

export const loadBalances = (apiKey, secretKey) => {
  return axios.get('http://localhost:3000/loadBalances', {
    params: {
      apiKey: apiKey,
      secretKey: secretKey
    }
  });
};

export const marketBuyOrder = async (params) => {
  return axios.get('http://localhost:3000/marketBuyOrder', {
    params: params
  })
};

export const limitSellOrder = async (params) => {
  return axios.get('http://localhost:3000/limitSellOrder', {
    params: params
  })
};



export const stopLossLimitSellOrder = async (params) => {
  return axios.get('http://localhost:3000/stopLossLimitSellOrder', {
    params: params
  })
};
