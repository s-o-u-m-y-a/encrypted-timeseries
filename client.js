import WebSocket from 'ws';
import { encryptData, getSumCheckMessage, getRandomValue } from './util.js';

const ws = new WebSocket('ws://localhost:3000');


ws.on('open', function open() {
  setInterval(function(){    
    //generate series of data by passing min & max value
    let limit = getRandomValue(1, 5);
    let serializeData = [];
    for(let i = 0; i< limit; i++) {
      serializeData.push(encryptData(JSON.stringify(getSumCheckMessage())));
    }
    console.log("serializeData: ", serializeData.join('|'))
    ws.send(
      serializeData.join('|')
    );
  }, 10000)

});