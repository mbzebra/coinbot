'use strict';

const axios = require('axios');
const entries = require('object.entries');
var attributeHelper = require('./lib/DynamoAttributesHelper');
var config = require('./configuration/config');


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

    axios.all(promiseArray)
        .then(function(results) {
            let temp = results.map(response => entries(entries(entries(response.data.result)[0][1])[2][1])[0][1]);
            console.log(temp);
            callback(close(sessionAttributes, 'Fulfilled', {
                'contentType': 'PlainText',
                'content': `Price of Top Coins is ${temp}`
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

    var URI = 'https://api.kraken.com/0/public/Ticker?pair=' + coinName;

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