"use client";

import React, { useState, useEffect } from 'react';

const SubscribeTicks = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [threshold, setThreshold] = useState('');
  const [condition, setCondition] = useState('above');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [tickData, setTickData] = useState(null);

  const symbols = {
    "AUD/CAD": "frxAUDCAD",
    "AUD/CHF": "frxAUDCHF",
    "AUD/JPY": "frxAUDJPY",
    "AUD/NZD": "frxAUDNZD",
    "AUD/USD": "frxAUDUSD",
    "Australia 200": "OTC_AS51",
    "BTC/USD": "cryBTCUSD",
    "Bear Market Index": "RDBEAR",
    "Boom 300 Index": "BOOM300N",
    "Boom 500 Index": "BOOM500",
    "Boom 1000 Index": "BOOM1000",
    "Bull Market Index": "RDBULL",
    "Crash 300 Index": "CRASH300N",
    "Crash 500 Index": "CRASH500",
    "Crash 1000 Index": "CRASH1000",
    "ETH/USD": "cryETHUSD",
    "EUR Basket": "WLDEUR",
    "EUR/AUD": "frxEURAUD",
    "EUR/CAD": "frxEURCAD",
    "EUR/CHF": "frxEURCHF",
    "EUR/GBP": "frxEURGBP",
    "EUR/JPY": "frxEURJPY",
    "EUR/NZD": "frxEURNZD",
    "EUR/USD": "frxEURUSD",
    "Euro 50": "OTC_SX5E",
    "France 40": "OTC_FCHI",
    "GBP Basket": "WLDGBP",
    "GBP/AUD": "frxGBPAUD",
    "GBP/CAD": "frxGBPCAD",
    "GBP/CHF": "frxGBPCHF",
    "GBP/JPY": "frxGBPJPY",
    "GBP/NOK": "frxGBPNOK",
    "GBP/NZD": "frxGBPNZD",
    "GBP/USD": "frxGBPUSD",
    "Germany 40": "OTC_GDAXI",
    "Gold Basket": "WLDXAU",
    "Gold/USD": "frxXAUUSD",
    "Hong Kong 50": "OTC_HSI",
    "Japan 225": "OTC_N225",
    "Jump 10 Index": "JD10",
    "Jump 25 Index": "JD25",
    "Jump 50 Index": "JD50",
    "Jump 75 Index": "JD75",
    "Jump 100 Index": "JD100",
    "NZD/JPY": "frxNZDJPY",
    "NZD/USD": "frxNZDUSD",
    "Netherlands 25": "OTC_AEX",
    "Palladium/USD": "frxXPDUSD",
    "Platinum/USD": "frxXPTUSD",
    "Silver/USD": "frxXAGUSD",
    "Step Index": "stpRNG",
    "Swiss 20": "OTC_SSMI",
    "UK 100": "OTC_FTSE",
    "US 500": "OTC_SPC",
    "US Tech 100": "OTC_NDX",
    "USD Basket": "WLDUSD",
    "USD/CAD": "frxUSDCAD",
    "USD/CHF": "frxUSDCHF",
    "USD/JPY": "frxUSDJPY",
    "USD/MXN": "frxUSDMXN",
    "USD/NOK": "frxUSDNOK",
    "USD/PLN": "frxUSDPLN",
    "USD/SEK": "frxUSDSEK",
    "Volatility 10 (1s) Index": "1HZ10V",
    "Volatility 10 Index": "R_10",
    "Volatility 25 (1s) Index": "1HZ25V",
    "Volatility 25 Index": "R_25",
    "Volatility 50 (1s) Index": "1HZ50V",
    "Volatility 50 Index": "R_50",
    "Volatility 75 (1s) Index": "1HZ75V",
    "Volatility 75 Index": "R_75",
    "Volatility 100 (1s) Index": "1HZ100V",
    "Volatility 100 Index": "R_100",
    "Volatility 150 (1s) Index": "1HZ150V",
    "Volatility 250 (1s) Index": "1HZ250V",
    "Wall Street 30": "OTC_DJI"
  };

  const handleSymbolChange = (e) => {
    setSelectedSymbol(e.target.value);
  };

  const handleThresholdChange = (e) => {
    setThreshold(e.target.value);
  };

  const handleConditionChange = (e) => {
    setCondition(e.target.value);
  };

  const handleSubscribe = async () => {
    if (!selectedSymbol || !threshold) return;

    try {
      const response = await fetch('http://localhost:3000/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol: selectedSymbol, threshold, condition }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.text();
      console.log(result);
      setIsSubscribed(true);
    } catch (error) {
      console.error('Error subscribing to symbol:', error);
    }
  };

  const handleUnsubscribe = async () => {
    if (!selectedSymbol) return;

    try {
      const response = await fetch('http://localhost:3000/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol: selectedSymbol }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.text();
      console.log(result);
      setIsSubscribed(false);
    } catch (error) {
      console.error('Error unsubscribing from symbol:', error);
    }
  };

  const fetchTickData = async () => {
    if (!isSubscribed || !selectedSymbol) return;

    try {
      const response = await fetch('http://localhost:3000/tick', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log(data);
      setTickData(data);
    } catch (error) {
      console.error('Error fetching tick data:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchTickData, 2000);
    return () => clearInterval(interval);
  }, [isSubscribed, selectedSymbol]);

  return (
    <div className='gap-4 flex flex-col items-center'>
      <div className='flex gap-8 grid grid-cols-1 sm:grid-cols-3'>
        <select id="symbol-select" onChange={handleSymbolChange} className='border-2 p-4 rounded-xl hover:border-green-200'>
          <option value="">Select Symbol</option>
          {Object.entries(symbols).map(([displayName, symbol]) => (
            <option key={symbol} value={symbol}>
              {displayName}
            </option>
          ))}
        </select>
        <input
          type="number"
          id="threshold-input"
          placeholder="Enter threshold"
          value={threshold}
          onChange={handleThresholdChange}
          className='border-2 rounded-xl p-4 hover:border-green-200'
        />
        <select id="condition-select" onChange={handleConditionChange} className='border-2 rounded-xl p-4 hover:border-green-200'>
          <option value="above">Above</option>
          <option value="below">Below</option>
        </select>
      </div>
      <div>
        <button onClick={handleSubscribe} disabled={!selectedSymbol || isSubscribed} className={`border-2 p-4 rounded-xl ml-4 focus:outline-none transition-all duration-300 ${(isSubscribed) ? 'border-gray-400 text-gray-400 cursor-not-allowed' : 'border-green-400 hover:bg-green-400 hover:text-white cursor-pointer'}`}>Subscribe</button>
        <button onClick={handleUnsubscribe} disabled={!selectedSymbol || !isSubscribed} className={`border-2 p-4 rounded-xl ml-4 focus:outline-none transition-all duration-300 ${(!selectedSymbol || !isSubscribed) ? 'border-gray-400 text-gray-400 cursor-not-allowed' : 'border-red-500 hover:bg-red-500 hover:text-white cursor-pointer'}`}>Unsubscribe</button>
      </div>
      <div className='flex bg-gray-200 p-8 rounded'>
        {tickData && (
          <div className='flex items-left grid'>
            <h3><pre>Latest Subscription: </pre></h3>
            <pre className=''>{JSON.stringify(tickData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div >
  );
};

export default SubscribeTicks;
