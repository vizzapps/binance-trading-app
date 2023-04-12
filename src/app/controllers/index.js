let crypto = require('crypto');
let axios = require('axios');
let config = require('../../config/config');

function verifyAccount(req, res) {
  const apiKey = req.query.apiKey;
  const secretKey = req.query.secretKey;
  const url = config.binance.urls.real.rest_url + '/api/v3/account';
  const timestamp = new Date().getTime();
  const queryString = `recvWindow=59999&timestamp=${timestamp}`;
  createRequest(url, 'get', queryString, res, apiKey, secretKey);
}

function marketBuyOrder(req, res) {
  const {symbol, side, type, quoteOrderQty, apiKey, secretKey} = req.query;
  const url = config.binance.urls.real.rest_url + '/api/v3/order';
  const timestamp = new Date().getTime();
  const queryString = `recvWindow=59999&symbol=${symbol}&side=${side}&type=${type}&quoteOrderQty=${quoteOrderQty}&timestamp=${timestamp}`;
  createRequest(url, 'post', queryString, res, apiKey, secretKey);
}


function limitSellOrder(req, res) {
  const {symbol, side, type, quantity, price, apiKey, secretKey} = req.query;
  const url = config.binance.urls.real.rest_url + '/api/v3/order';
  const timestamp = new Date().getTime();
  const queryString = `recvWindow=59999&symbol=${symbol}&side=${side}&type=${type}&quantity=${quantity}&price=${price}&timestamp=${timestamp}`;
  createRequest(url, 'post', queryString, res, apiKey, secretKey);
}



function stopLossLimitSellOrder(req, res) {
  const {symbol, side, type, timeInForce, quantity, price, stopPrice, apiKey, secretKey} = req.query;
  const url = config.binance.urls.real.rest_url + '/api/v3/order';
  const timestamp = new Date().getTime();
  const queryString = `recvWindow=59999&symbol=${symbol}&side=${side}&type=${type}&timeInForce=${timeInForce}&quantity=${quantity}&price=${price}&stopPrice=${stopPrice}&timestamp=${timestamp}`;
  createRequest(url, 'post', queryString, res, apiKey, secretKey);
}


const createRequest = (url, method, queryString, res, apiKey, secretKey) => {
  const signature = crypto.createHmac('sha256', secretKey)
    .update(queryString)
    .digest('hex');
  queryString = queryString + `&signature=${signature}`;
  axios({
    method: method,
    url : `${url}?${queryString}`,
    headers: {
      'X-MBX-APIKEY' : apiKey
    },
  }).then(response => {
    res.send(response.data)
  }).catch(error => {
    res.send(error);
  })
};

module.exports = {
  verifyAccount,
  marketBuyOrder,
  limitSellOrder,
  stopLossLimitSellOrder
};
