import React from 'react';
import '../../App.global.css';
import Div from '../../components/Div';
import { Link } from 'react-router-dom';
import { checkCredential, getCurrent, getBalances, buyOrder, sendOrder1, sendOrder2, convert} from '../../services/utils';

const Main = () => {
  const [verified, setVerified] = React.useState(false);
  const [log, setLog] = React.useState([]);
  const [isStopLoss, setStopLoss] = React.useState(false);
  const [isSplitCut, setSplitCut] = React.useState(false);
  const [optionValue, setOptionValue] = React.useState();
  const [balance, setBalance] = React.useState({});
  const [coin, setCoin] = React.useState('');
  const [quoteOrderQty, setQuoteOrderQty] = React.useState('');
  const [quoteOrderQty1, setQuoteOrderQty1] = React.useState('');
  const [quoteOrderQty2, setQuoteOrderQty2] = React.useState('');
  const [profit, setProfit] = React.useState('');
  const [profit1, setProfit1] = React.useState('');
  const [profit2, setProfit2] = React.useState('');
  const [stopLossValue, setStopLossValue] = React.useState('');

  const [isReady, setReady] = React.useState(false);

  const updateStopLossValue = (e) => {
    setStopLossValue(e);
  };
  const updateProfit = (e) => {

    const timestamp = new Date().getTime();
    console.log('--------------------', timestamp);

    setProfit(e);
  };
  const updateProfit1 = (e) => {
    setProfit1(e);
  };
  const updateProfit2 = (e) => {
    setProfit2(e);
  };
  const updateStopLoss = () => {
    setStopLoss(!isStopLoss);
  };
  const updateSplitCut = () => {
    setSplitCut(!isSplitCut);
  };
  const updateOptionValue = async (e) => {
    setOptionValue(e);
    const balances = await getBalances();
    balances.data.balances.map(item => {
      if (item.asset === e){
        setBalance(item);
      }
    })
  };
  const updateSymbol = (e) => {
    setCoin(e);
  };
  const updateQuoteOrderQty = (e) => {
    setQuoteOrderQty(e);
  };
  const updateQuoteOrderQty1 = (e) => {
    setQuoteOrderQty1(e);
    setQuoteOrderQty2(quoteOrderQty - e);
  };

  const updateReady = () => {
    setReady(!isReady);
  };

  const updateLogs = (orders) => {
    let logs = [];
    orders.map(item => {
      if (item.orderContent.data.orderId !== undefined){
        logs.push(`${item.orderContent.data.transactTime} ${item.orderType} order placed successfully.`);
      } else {
        logs.push(`------------- ${item.orderType} order failed`);
      }
    });
    setLog(logs);
  }
  
  const submitOrders = async (e) => {
    if (e.key === 'Enter'){
      if (!isReady){
        console.log('Please confirm all parameters again.');
        return;
      }
      /**
       * Get filled amount bought from base assets
       **/
      const buyResult = await buyOrder({
        symbol: `${coin}${optionValue}`,
        side: 'BUY',
        type: 'MARKET',
        quoteOrderQty: quoteOrderQty
      });

      console.log(buyResult);

      let filledAmount = 0;
      let orders = [];

      if (buyResult.data.fills.length > 0) {
        buyResult.data.fills.map(item => {
          filledAmount += parseFloat(item.qty);
        });
        orders.push({orderType: 'MARKET', orderContent: buyResult});
      } else {
        return;
      }

      /**
       * Send sell_orders
       * */

      const limitPrice = quoteOrderQty * (1 + profit / 100) / filledAmount;
      const stopLossLimitPrice = quoteOrderQty * (1 - stopLossValue / 100) / filledAmount;
      const stopLossLimitStopPrice = quoteOrderQty * (1 - (parseFloat(stopLossValue) + 1) / 100) / filledAmount;

      if (!isSplitCut && !isStopLoss) {
        const tpOrder0 = await sendOrder1({
          symbol: `${coin}${optionValue}`,
          side: 'SELL',
          type: 'LIMIT_MAKER',
          quantity: `${convert(filledAmount)}`,
          price: `${convert(limitPrice)}`
        });
        console.log(tpOrder0);
        orders.push({orderType: 'LIMIT_MAKER', orderContent: tpOrder0});
        updateLogs(orders);

      }

      if (!isSplitCut && isStopLoss){
        const tpOrder = await sendOrder1({
          symbol: `${coin}${optionValue}`,
          side: 'SELL',
          type: 'LIMIT_MAKER',
          quantity: `${convert(filledAmount)}`,
          price: `${convert(limitPrice)}`
        });
        console.log(tpOrder);
        orders.push({orderType: 'LIMIT_MAKER', orderContent: tpOrder});

        const slOrder = await sendOrder2({
          symbol: `${coin}${optionValue}`,
          side: 'SELL',
          type: 'STOP_LOSS_LIMIT',
          timeInForce: 'GTC',
          quantity: `${convert(filledAmount)}`,
          price: `${convert(stopLossLimitPrice)}`,
          stopPrice: `${convert(stopLossLimitStopPrice)}`
        });
        console.log(slOrder);
        orders.push({orderType: 'STOP_LOSS_LIMIT', orderContent: slOrder});
        updateLogs(orders);
      }

      if (isSplitCut && isStopLoss){
        const quantity1 = filledAmount * (quoteOrderQty1 / quoteOrderQty);
        const quantity2 = filledAmount - quantity1;
        const limitPrice1 = quoteOrderQty1 * (1 + profit1 / 100) / quantity1;
        const limitPrice2 = quoteOrderQty2 * (1 + profit2 / 100) / quantity2;
        const stopLossLimitPrice1 = quoteOrderQty1 * (1 - stopLossValue / 100) / quantity1;
        const stopLossLimitStopPrice1 = quoteOrderQty1 * (1 - (parseFloat(stopLossValue) + 1) / 100) / quantity1;
        const stopLossLimitPrice2 = quoteOrderQty2 * (1 - stopLossValue / 100) / quantity2;
        const stopLossLimitStopPrice2 = quoteOrderQty2 * (1 - (parseFloat(stopLossValue) + 1) / 100) / quantity2;

        const tpOrder1 = await sendOrder1({
          symbol: `${coin}${optionValue}`,
          side: 'SELL',
          type: 'LIMIT_MAKER',
          quantity: `${convert(quantity1)}`,
          price: `${convert(limitPrice1)}`
        });
        console.log(tpOrder1);
        orders.push({orderType: 'LIMIT_MAKER', orderContent: tpOrder1});

        const slOrder1 = await sendOrder2({
          symbol: `${coin}${optionValue}`,
          side: 'SELL',
          type: 'STOP_LOSS_LIMIT',
          timeInForce: 'GTC',
          quantity: `${convert(quantity1)}`,
          price: `${convert(stopLossLimitPrice1)}`,
          stopPrice: `${convert(stopLossLimitStopPrice1)}`
        });
        console.log(slOrder1);
        orders.push({orderType: 'STOP_LOSS_LIMIT', orderContent: slOrder1});

        const tpOrder2 = await sendOrder1({
          symbol: `${coin}${optionValue}`,
          side: 'SELL',
          type: 'LIMIT_MAKER',
          quantity: `${convert(quantity2)}`,
          price: `${convert(limitPrice2)}`
        });
        console.log(tpOrder2);
        orders.push({orderType: 'LIMIT_MAKER', orderContent: tpOrder2});

        const slOrder2 = await sendOrder2({
          symbol: `${coin}${optionValue}`,
          side: 'SELL',
          type: 'STOP_LOSS_LIMIT',
          timeInForce: 'GTC',
          quantity: `${convert(quantity2)}`,
          price: `${convert(stopLossLimitPrice2)}`,
          stopPrice: `${convert(stopLossLimitStopPrice2)}`
        });
        console.log(slOrder2);
        orders.push({orderType: 'STOP_LOSS_LIMIT', orderContent: slOrder2});
        
        updateLogs(orders);
      }
    }
  };

  React.useEffect(() => {
    checkCredential().then((res) => {
      setVerified(res);
      if (res){
        setLog([`${getCurrent()} Binance API successfully authenticated.`])
      }else {
        setLog([`${getCurrent()} Binance API authentication failed.`])
      }
    });
  }, []);

  return (
    <>
      <Div className={'funcLayer'} style={{fontSize: 30}}>
        <Link to={{pathname: '/settings'}} style={{textDecoration: 'none', color: 'grey'}}>&#9881;</Link>
      </Div>
      <Div className={'layer'}>
        <Div className={'layerTitle'} children='Base Assets:'/>
        <Div style={{marginBottom: 10}}>
          <select style={{width: '100%'}} disabled={!verified || isReady} value={optionValue}
                  onChange={event => updateOptionValue(event.target.value)}>
            <option value='BTC'>BTC</option>
            <option value='USDT'>USDT</option>
            <option value='BNB'>BNB</option>
          </select>
        </Div>
        <Div>Available: {balance.free}</Div>
        <Div>Locked: {balance.locked}</Div>
        <Div>Total: {balance.free}</Div>
      </Div>

      <Div className={'layer'}>
        <Div className={'layerTitle'} children='Buy Order:'/>
        <Div style={{flexDirection: 'row'}}>
          <Div style={{flexDirection: 'row', width: '50%'}}>
            <Div className={'label'}>Order Size: </Div>
            <input className={'inputSize'} type='number' disabled={!verified || isReady} value={quoteOrderQty}
                   onChange={event => updateQuoteOrderQty(event.target.value)}/>
          </Div>
          <Div style={{flexDirection: 'row', width: '50%'}}>
            <input type='checkbox' checked={isStopLoss} onChange={updateStopLoss} disabled={!verified || isReady}/>
            <Div className={'label'}>SL %: </Div>
            <input className={'inputSize'} type='number' disabled={!verified || !isStopLoss || isReady} value={stopLossValue}
                   onChange={event => updateStopLossValue(event.target.value)} min={0} max={100} step={0.1}/>
          </Div>
        </Div>
      </Div>

      <Div className={'layer'}>
        <Div className={'layerTitle'} children='Sell Order:'/>
        <Div style={{flexDirection: 'row', marginBottom: 10}}>
          <Div style={{flexDirection: 'row', width: '50%'}}>
            <input type='checkbox' disabled={!verified || isReady} checked={isSplitCut} onChange={updateSplitCut}/>
            <Div>Split Cut: </Div>
          </Div>
          <Div style={{flexDirection: 'row', width: '50%'}}>
            <Div className={'label'}>TP %: </Div>
            <input className={'inputSize'}  type='number' disabled={isSplitCut || !verified || isReady} value={profit}
                   onChange={event => updateProfit(event.target.value)} min={0} max={100} step={0.1}/>
          </Div>
        </Div>

        <Div style={{flexDirection: 'row'}}>
          <Div className={'subLayer'}>
            <Div className={'layerTitle'} children='Slice1'/>
            <Div style={{flexDirection: 'row'}}>
              <Div style={{flexDirection: 'row', width: '50%'}}>
                <input className={'inputSize'} type='number' disabled={!verified || !isSplitCut || isReady}
                       value={quoteOrderQty1} onChange={event => updateQuoteOrderQty1(event.target.value)}/>
              </Div>
              <Div style={{flexDirection: 'row', width: '50%'}}>
                <Div className={'label'}>TP%:</Div>
                <input className={'inputSize'} type='number' disabled={!verified || !isSplitCut || isReady} value={profit1}
                       onChange={event => updateProfit1(event.target.value)}/>
              </Div>
            </Div>
          </Div>

          <Div className={'subLayer'}>
            <Div className={'layerTitle'} children='Slice2'/>
            <Div style={{flexDirection: 'row'}}>
              <Div style={{flexDirection: 'row', width: '50%'}}>
                <input className={'inputSize'} type='number' disabled={true} value={quoteOrderQty2}/>
              </Div>
              <Div style={{flexDirection: 'row', width: '50%'}}>
                <Div className={'label'}>TP%:</Div>
                <input className={'inputSize'} type='number' disabled={!verified || !isSplitCut || isReady} value={profit2}
                       onChange={event => updateProfit2(event.target.value)}/>
              </Div>
            </Div>
          </Div>
        </Div>
      </Div>

      <Div className={'layer'}>
        <Div className={'layerTitle'} children='Pump Token:'/>
        <Div style={{flexDirection: 'row', marginBottom: 10}}>
          <Div>
            <input type='checkbox' disabled={!verified} checked={isReady} onChange={updateReady}/>
          </Div>
          <Div>I made sure that the above parameters are accurate</Div>
        </Div>
        <Div style={{justifyContent: 'center'}} children='Coin/Token Name:'/>
        <Div>
          <input type='text' style={{width: '100%'}} value={coin} onKeyDown={submitOrders}
                 onChange={event => updateSymbol(event.target.value)}/>
        </Div>
      </Div>

      <Div className={'layer'}>
        <Div className={'layerTitle'} children='Log:'/>
        <Div className={'loggingArea'} style={{flexDirection: 'column'}}>
          {
            log.map(item => {
              return (
                <Div key={item}>{item}</Div>
              )
            })
          }
        </Div>
      </Div>
    </>
  );
};

export default Main;

