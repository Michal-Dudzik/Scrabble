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
let serverplayers:Player;
let serverboards:Board;
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
    serverplayers[socket.id] = new Player(socket.id) //adding player to list of players
    serverboards[roomNo] = new Board(roomNo) //creating new board
    serverboards[roomNo].player1 = serverplayers[socket.id] //adding player to board
  }
  else if(clientNo % 2 === 0)
  {
    //creating player 2
    serverplayers[socket.id] = new Player(socket.id) //adding player to list of players
    serverboards[roomNo].player2 = serverplayers[socket.id] //adding player to board
    serverboards[roomNo].GenerateEmptyBoard() //generating empty board
    
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

class Board
{
    id:string 
    gameboard: any[][] = []//type any because every other type created problems 
    player1:Player
    player2:Player  //list of player id's that are currently playing 
    constructor(serverroomid:string)
    {
        this.id = serverroomid
            
    }
    public GenerateEmptyBoard() //method generating board and filling it with empty tiles
    {
        
        const rows:number = 14
        const columns:number = 14
        for (var i = 0; i < rows; i++)
        {
             for (var j = 0; j < columns; j++)
             {
                const emptytile: EmptyTile = new EmptyTile()
                this.gameboard[i][j].push(emptytile);
             }
        }     
        console.log("board has been generated")  
    }
}
 interface ITile
{
    
    readonly type: number // 0 = empty else its letter (A = 1, B = 2...)
    readonly value: number 
    readonly status: number// 0 = tile in storage / 1 = tile is in player's hand / 2 = tile is on gameboard during acceptance phase / 3 = tile is placed on board 
}

 class EmptyTile implements ITile
{
    
    readonly type: number // 0 = empty tile
    readonly value: number // 0 = empty tile
    public status: number // 3 because empty tile can only apear on gameboard during board generation / 4 if tile contains bonus (probably wont be implemented)
    public constructor(){

    }
    
   
}
 class LetterTile implements ITile
{
    readonly type: number // A = 1, B = 2 etc
    readonly value: number // value of tile that is used in counting score
    public status: number 
    public id: number // every letter tile has its unique id

    public constructor() // TO DO
    {
        
    }
}
class Player
{
    id:string; //value by which player can be recognized
    nickname: string; //can be set by player but doesnt serve any bigger reason
    playerhand: PlayerHand []// hand is storage of players tiles
    score: number
    constructor(socketid:string) //TO DO
    {
        this.playerhand = []
        this.id = socketid
        this.nickname = "Harold" //If we have too much time we can add this functionality
        this.score = 0
    }
}
class PlayerHand
{
    static playerhand: [LetterTile] //array storing letters currently held by player
    static fillplayershand(unusedtilestorage: UnusedTiles["unusedtilestorage"]) //used at start of game to give player tiles to play with
    {
        for(var i:number = 0; i < 6; i++) //draws few tiles to fill players hand
        {
            const newtile: LetterTile = unusedtilestorage[Math.floor(Math.random()*unusedtilestorage.length)]//find random tile from unusedtilestorage
            this.playerhand.push(newtile)
        }
        console.log("Player's hand has been filled")
    }
    static tradetiles(chosentile: LetterTile, unusedtilestorage: UnusedTiles["unusedtilestorage"]) //TO DO removes tile chosen by player from his hand and gives him random one from unusedtilestorage
    {
        const index = this.playerhand.map(object => object.id).indexOf(chosentile.id) //find index of choesentile
        this.playerhand.splice(index, 1) //remove chosentile from players hand
        const newtile: LetterTile = unusedtilestorage[Math.floor(Math.random()*unusedtilestorage.length)]//find random tile from unusedtilestorage
        unusedtilestorage.push(chosentile) //return tile to unusedtilestorage
        this.playerhand.push(newtile)
        console.log("Tile {0} has been removed from players hand and tile {1} has been added", chosentile.value, newtile.value)
    }
    static drawtile(unusedtilestorage: UnusedTiles["unusedtilestorage"]) //used at end of each round
    {
        const newtile: LetterTile = unusedtilestorage[Math.floor(Math.random()*unusedtilestorage.length)]//find random tile from unusedtilestorage
        this.playerhand.push(newtile)
        console.log("TIle {0} has been added to players hand", newtile.value)
    }
}
 class UnusedTiles
{
    unusedtilestorage: [LetterTile] //array storing lettertiles
    //idk what else can be stored in this class
    filltilestorage()
    {
       // this.unusedtilestorage{} @Michał Dudzik to twoje zadanie masz wypisać tu wpisać wszystkie literki wraz z ich wartościami dzięki <3
       //create an array of all letters with their values, state, id and ammount of avalaible tiles
        


         
    }
}
