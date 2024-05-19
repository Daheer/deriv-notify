const WebSocket = require('ws');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const app_id = 1089;
const derivWsUrl = `wss://ws.derivws.com/websockets/v3?app_id=${app_id}`;
let derivConnection;
let reconnectInterval = 5000;  // 5 seconds
let heartbeatInterval = 30000; // 30 seconds
let heartbeatTimeout;

let currentSymbol = 'R_100';
let subscriptionIds = {};
let latestTickData = null;
let threshold = null;
let condition = null;
let nSentMessages = 0;

const connectWebSocket = () => {
  derivConnection = new WebSocket(derivWsUrl);

  derivConnection.onopen = () => {
    console.log('Connected to Deriv API');
    if (currentSymbol) {
      subscribeTicks(currentSymbol);
    }
    startHeartbeat();
  };

  derivConnection.onclose = () => {
    console.log('Disconnected from Deriv API, attempting to reconnect...');
    clearTimeout(heartbeatTimeout);
    setTimeout(connectWebSocket, reconnectInterval);
  };

  derivConnection.onerror = (error) => {
    console.error('WebSocket error:', error.message);
  };

  derivConnection.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.error) {
      console.error('Error:', data.error.message);
    } else if (data.msg_type === 'tick') {
      latestTickData = data.tick;
      if (threshold !== null && condition !== null) {
        if (
          (condition === 'above' && latestTickData.quote >= threshold) ||
          (condition === 'below' && latestTickData.quote <= threshold)
        ) {
          if (nSentMessages >= 1) {
            console.log(`Alerted about ${data.tick.symbol} already, skipping...`);
            return;
          }
          sgMail.setApiKey(process.env.SENDGRID_API_KEY)
          const msg = {
            to: 'suhayrid6@gmail.com',
            from: 'mdindau@gmail.com',
            subject: `Deriv-Notify alert about ${data.tick.symbol}`,
            text: `Omo guy, ${data.tick.symbol} don dey ${condition} ${threshold} oo`,
            html: `Omo guy, <bold>${data.tick.symbol}</bold> don dey <bold>${condition}</bold> <bold>${threshold}</bold> oo`,
          }
          sgMail
            .send(msg)
            .then(() => {
              console.log('Email sent');
            })
            .catch((error) => {
              console.error(error);
            });
          console.log('Send alert');
          nSentMessages += 1;
        }
      }
      const symbolId = data.subscription.id;
      subscriptionIds[data.tick.symbol] = symbolId;
      console.log(`${data.tick.symbol} = ${data.tick.quote}`);
    }
  };
};

const startHeartbeat = () => {
  if (derivConnection.readyState === WebSocket.OPEN) {
    derivConnection.send(JSON.stringify({ ping: 1 }));
    heartbeatTimeout = setTimeout(startHeartbeat, heartbeatInterval);
  }
};

const subscribeTicks = (symbol) => {
  derivConnection.send(JSON.stringify({ ticks: symbol, subscribe: 1 }));
};

const unsubscribeTicks = (symbol) => {
  const symbolId = subscriptionIds[symbol];
  derivConnection.send(JSON.stringify({ forget: symbolId }));
};

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

app.post('/subscribe', (req, res) => {
  const { symbol, threshold: newThreshold, condition: newCondition } = req.body;
  if (symbol) {
    unsubscribeTicks(currentSymbol);
    currentSymbol = symbol;
    threshold = parseFloat(newThreshold);
    condition = newCondition;
    subscribeTicks(symbol);
    res.status(200).send(`Subscribed to ${symbol}`);
  } else {
    res.status(400).send('Invalid symbol');
  }
});

app.post('/unsubscribe', (req, res) => {
  const { symbol } = req.body;
  if (symbol && symbol === currentSymbol) {
    unsubscribeTicks(symbol);
    currentSymbol = null;
    threshold = null;
    condition = null;
    nSentMessages = 0;
    res.status(200).send(`Unsubscribed from ${symbol}`);
  } else {
    res.status(400).send('Invalid symbol or not currently subscribed to this symbol');
  }
});

app.get('/tick', (req, res) => {
  if (latestTickData) {
    res.status(200).json(latestTickData);
  } else {
    res.status(204).send('No tick data available');
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  connectWebSocket();
});
