'use strict';

const axios = require('axios');
const entries = require('object.entries');
var attributeHelper = require('./lib/DynamoAttributesHelper');


// Close dialog with the customer, reporting fulfillmentState of Failed or Fulfilled ("Thanks, your pizza will arrive in 20 minutes")
function close(sessionAttributes, fulfillmentState, message) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState,
            message,
        },
    };
}

// --------------- Events -----------------------

function getTickerDetails(tickerKey) {
    var URI = 'https://api.kraken.com/0/public/Ticker?pair=' + tickerKey;
    return axios.get(URI);

}

function getTopCoinPrice(callback,sessionAttributes) {
    var topCoins = ['XBTUSD', 'ETHUSD', 'LTCUSD', 'XRPUSD', 'ETCUSD']


    var URI = 'https://api.kraken.com/0/public/Ticker?pair=';

    let promiseArray = topCoins.map(url => axios.get(URI + url));
    let ctr = 0;
    axios.all(promiseArray)
        .then(function(results) {
            let temp = results.map(response => entries(entries(entries(response.data.result)[0][1])[2][1])[0][1]);
            console.log(topCoins[ctr++], "=",  temp);
            callback(close(sessionAttributes, 'Fulfilled', {
                'contentType': 'PlainText',
                'content': `Price of Bitcoin, Ethereum, Litecoin, Ripple and Ethereum Classic are ${temp}`
            }));

        })
        .catch((error) => {
            console.log("error is", error);

            callback(close(sessionAttributes, 'Fulfilled', {
                'contentType': 'PlainText',
                'content': `I am unable to find any information for Top Coins. Please try with a valid coin name or index. `
            }));

        })

}


function getCoinPrice(coinName, callback,sessionAttributes) {

    var coinValue = "";
    switch (coinName.toLowerCase()) {
        case "bitcoin":
            coinValue = "XBTUSD"
            break;
        case "ripple":
            coinValue = "XRPUSD"
            break;
        case "ethereum":
            coinValue = "ETHUSD"
            break;
        case "classic":
            coinValue = "ETCUSD"
            break;
        case "ethereum classic":
            coinValue = "ETCUSD"
            break;
        case "ec":
            coinValue = "ETCUSD"
            break;
        case "xbt":
            coinValue = "XBTUSD"
            break;
        case "bit":
            coinValue = "XBTUSD"
            break;
        case "eth":
            coinValue = "ETHUSD"
            break;
        case "rip":
            coinValue = "XRPUSD"
            break;
        case "icon":
            coinValue = "ICNUSD"
            break;
        case "iconomi":
            coinValue = "ICNUSD"
            break;
        case "dash":
            coinValue = "DASHUSD"
            break;            
        case "eos":
            coinValue = "EOSUSD"
            break;  
         case "usdt":
            coinValue = "USDTUSD"
            break;  
        case "lite":
            coinValue = "LTCUSD"
            break;  
        case "litecoin":
            coinValue = "LTCUSD"
            break;  
        default:
            coinValue = coinName
            break;
    }

    if(coinValue.length<1) return;
    var URI = 'https://api.kraken.com/0/public/Ticker?pair=' + coinValue;

    axios.get(URI)
        .then(response => {
            let coinPrice = entries(entries(entries(response.data.result)[0][1])[2][1])[0][1];
            console.log("Coin Price is", coinPrice);
            callback(close(sessionAttributes, 'Fulfilled', {
                'contentType': 'PlainText',
                'content': `Price of ${coinName} is ${coinPrice}`
            }));
        })
        .catch((error) => {
            console.log("error is", error);

            callback(close(sessionAttributes, 'Fulfilled', {
                'contentType': 'PlainText',
                'content': `I am unable to find any information for ${coinName}. Please try with a valid coin name or index. `
            }));

        })

}

function dispatch(intentRequest, callback) {
    console.log('request received for userId=${intentRequest.userId}, intentName=${intentRequest.currentIntent.intentName}');
    const sessionAttributes = intentRequest.sessionAttributes;
    const slots = intentRequest.currentIntent.slots;
    const coinName = slots.coinName;
    console.log('coin name being processed is', coinName);

    if (slots.coinName.toLowerCase() == "topcoins" || slots.coinName.toLowerCase() == "top")
        getTopCoinPrice(callback,sessionAttributes);
    else
        getCoinPrice(coinName,callback,sessionAttributes);




}

// --------------- Main handler -----------------------

// Route the incoming request based on intent.
// The JSON body of the request is provided in the event slot.
exports.handler = (event, context, callback) => {
    try {
        dispatch(event,
            (response) => {
                callback(null, response);
            });
    } catch (err) {
        callback(err);
    }
};