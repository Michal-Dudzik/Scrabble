var express = require('express');
var app = express();
var io = require('socket.io')(5500);
// ======== SERVER STUFF ========
app.get('/', function (req, res) { return res.send('Hello World!'); });
var clientNo = 0;
var roomNo;
var serverplayers = [];
var serverboards = [];
io.on('connection', connected);
//setInterval(serverLoop, 1000/60); //not sure if needed
function connected(socket) {
    clientNo++;
    roomNo = Math.round(clientNo / 2); //assigning 2 players to rooms
    socket.join(roomNo);
    console.log('New player: ${clientNo}, joined room: ${roomNo}');
    if (clientNo % 2 === 1) {
        //creating player 1
        serverplayers[socket.id] = new Player(socket.id); //adding player to list of players
        serverboards[roomNo] = new Board(roomNo); //creating new board
        serverboards[roomNo].player1 = serverplayers[socket.id]; //adding player to board
    }
    else if (clientNo % 2 === 0) {
        //creating player 2
        serverplayers[socket.id] = new Player(socket.id); //adding player to list of players
        serverboards[roomNo].player2 = serverplayers[socket.id]; //adding player to board
        serverboards[roomNo].GenerateEmptyBoard(); //generating empty board
        serverboards[roomNo].tilestorage.filltilestorage(); //filling tilestorage with tiles
    }
    socket.on('disconnect', function () {
        //TODO usuniecie gracza z gry
    });
}
//tworzenie pokoju
//jeśli 2 gracze dołączyli to pojawia się guzik start
// jak go pacną to się odpali ta metoda ktora wygeneruje nowa plansze
//przypisze graczą ich kostki i rozpocznie "game loop"
//======== Game Models ========
var Board = /** @class */ (function () {
    function Board(serverroomid) {
        this.gameboard = []; //type any because every other type created problems 
        this.id = serverroomid;
    }
    Board.prototype.GenerateEmptyBoard = function () {
        var rows = 14;
        var columns = 14;
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < columns; j++) {
                var emptytile = new EmptyTile();
                this.gameboard[i][j].push(emptytile);
            }
        }
        console.log("board has been generated");
    };
    return Board;
}());
var EmptyTile = /** @class */ (function () {
    function EmptyTile() {
    }
    return EmptyTile;
}());
var LetterTile = /** @class */ (function () {
    function LetterTile(id, value, type, status) {
        this.id = id;
        this.value = value;
        this.status = status;
        this.type = type;
    }
    return LetterTile;
}());
var Player = /** @class */ (function () {
    function Player(socketid) {
        this.playerhand = []; // hand is storage of players tiles
        this.playerhand = [];
        this.id = socketid;
        this.nickname = "Harold"; //If we have too much time we can add this functionality
        this.score = 0;
    }
    return Player;
}());
var PlayerHand = /** @class */ (function () {
    function PlayerHand() {
    }
    PlayerHand.fillplayershand = function (unusedtilestorage) {
        for (var i = 0; i < 6; i++) //draws few tiles to fill players hand
         {
            var newtile = unusedtilestorage[Math.floor(Math.random() * unusedtilestorage.length)]; //find random tile from unusedtilestorage
            this.playerhand.push(newtile);
        }
        console.log("Player's hand has been filled");
    };
    PlayerHand.tradetiles = function (chosentile, unusedtilestorage) {
        var index = this.playerhand.map(function (object) { return object.id; }).indexOf(chosentile.id); //find index of choesentile
        this.playerhand.splice(index, 1); //remove chosentile from players hand
        var newtile = unusedtilestorage[Math.floor(Math.random() * unusedtilestorage.length)]; //find random tile from unusedtilestorage
        unusedtilestorage.push(chosentile); //return tile to unusedtilestorage
        this.playerhand.push(newtile);
        console.log("Tile {0} has been removed from players hand and tile {1} has been added", chosentile.value, newtile.value);
    };
    PlayerHand.drawtile = function (unusedtilestorage) {
        var newtile = unusedtilestorage[Math.floor(Math.random() * unusedtilestorage.length)]; //find random tile from unusedtilestorage
        this.playerhand.push(newtile);
        console.log("TIle {0} has been added to players hand", newtile.value);
    };
    PlayerHand.playerhand = []; //array storing letters currently held by player
    return PlayerHand;
}());
var UnusedTiles = /** @class */ (function () {
    function UnusedTiles() {
        this.unusedtilestorage = []; //array storing lettertiles
    }
    //idk what else can be stored in this class
    UnusedTiles.prototype.filltilestorage = function () {
        // this.unusedtilestorage{} @Michał Dudzik to twoje zadanie masz wypisać tu wpisać wszystkie literki wraz z ich wartościami dzięki <3
        //create an array of all letters with their values, state, id and ammount of avalaible tiles
        this.unusedtilestorage.push(new LetterTile(1, 3, "A", 0));
    };
    return UnusedTiles;
}());
