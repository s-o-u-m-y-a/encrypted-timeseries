import { WebSocketServer } from 'ws';
import { decryptedData, validateData, addTimestamp } from './util.js'
import { writetoDB } from './db.js';

const wss = new WebSocketServer({ port: 3000 });

wss.on('connection', function connection(ws) {
  try {
    var batch = [];
    var startDate = new Date();
    var seconds;
    ws.on('message', function incoming(message) {
      //console.log(message.toString());
      let incomingData = message.toString().split('|');
      incomingData.forEach(item => {
        let decryptedMessage = decryptedData(item);
        if (validateData(decryptedMessage)) {
          //Add timestamp to validated Data
          let validData = addTimestamp(decryptedMessage);
          
          //form batch for every mintue of data
          var endDate  = new Date();
          seconds = (endDate.getTime() - startDate.getTime()) / 1000;
          batch.push(validData);
          if(seconds > 60) {
            writetoDB(batch);
            seconds = 0;
            startDate = new Date();
            batch = [];
          }
        }
      })
    });

    ws.on('error', function onError(err) {
      console.log("Error while receiving message", err);
    })
  }
  catch (err) {
    console.error("Connection error!!", err);
  }
});