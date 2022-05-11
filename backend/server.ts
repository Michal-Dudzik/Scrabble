import { connect } from "http2";
import { Server } from "socket.io";
const express = require('express')
const app = express()
const io = require('socket.io')(5500)


// ======== SERVER STUFF ========


app.get('/', (req, res) => res.send('Hello World!'))


//generateBoard(); //this function generates board
let clientNo = 0;
let roomNo;

io.on('connection', connected);
//setInterval(serverLoop, 1000/60); //not sure if needed
function connected(socket) //function that initiates when player connects
{
  clientNo++
  roomNo = Math.round(clientNo/2)//assigning 2 players to rooms
  socket.join(roomNo)
  console.log('New player: ${clientNo}, joined room: ${roomNo}')
  if(clientNo % 2 === 1)
  {
    //creating player 1
  }
  else if(clientNo % 2 === 0)
  {
    //creating player 2
  }
  socket.on('disconnect', function(){

    //TODO usuniecie gracza z gry

    
  })
}
//tworzenie pokoju
//jeśli 2 gracze dołączyli to pojawia się guzik start
// jak go pacną to się odpali ta metoda ktora wygeneruje nowa plansze
//przypisze graczą ich kostki i rozpocznie "game loop"

//======== Game Models ========

