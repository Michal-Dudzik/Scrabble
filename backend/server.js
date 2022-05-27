"use strict";
exports.__esModule = true;
var http = require("http");
var express = require("express");
var socketio = require("socket.io");
var app = express();
app.use(express.static("./frontend")); //connection to frontend side
var server = http.createServer(app);
var io = socketio(server);
// ======== SERVER STUFF ========
var clientNo = 0;
var roomID;
var serverplayers = [];
var serverboards = [];
io.on("connection", function (socket) {
    var socc = socket;
    socket.emit("message", "Welcome to the game!"); //on connection to server send message to client
    var playerid = socket.id;
    console.log("New player:" + socket.id + ", connected to server");
    socket.on("message", function (text) { return io.emit("message", text); }); //receive message from client and send it to all clients
    //creating new room
    socket.on("newroom", function (username, roomName) {
        // if (!serverboards.some((e) => e.roomID === roomName)) {
        // 	/* vendors contains the element we're looking for */
        // 	roomID = roomName; // TO DO read room name from html and check if its allready taken
        // 	console.log("Room: " + roomID + " was created");
        // 	socc.join(roomID);
        // 	serverplayers[socc.id] = new Player(socc.id); //adding player to list of players
        // 	serverplayers[socc.id].player1.nickname = username;
        // 	serverboards[roomID] = new Board(roomID); //creating new board
        // 	serverboards[roomID].player1 = serverplayers[socc.id]; //adding player to board
        // 	console.log(
        // 		"New player:" + player1.nickname + ", created room: " + roomID
        // 	);
        // } else {
        // 	socc.emit("message", "Room with this name allready exists");
        // 	console.log("Room with this name allready exists");
        // }
        //if (serverboards.includes(roomName)) {
            
          if (serverboards.some((e) => e.roomID === roomName)) {
            socc.emit("message", "Room with this name allready exists");
            console.log("Room with this name allready exists");
        }
        else {
            roomID = roomName;
            console.log("Room: " + roomID + " was created");
            socc.join(roomID);
            console.log(username + " joined room: " + roomID);
            serverboards[roomID] = new Board(roomID),
            //add player to list of players
            serverplayers[socc.id] = new Player(socc.id);
            serverboards[roomID].player1 = serverplayers[socc.id];
            serverboards[roomID].player1.nickname = username;
            //create new board
            
                console.log("Owner of the room: " + serverboards[roomID].player1.nickname);
        }
    });
    socket.on("joinroom", function (username, roomName) {
        // listen for incoming data msg on this newly connected socket
        //wysyłąnie/odbieranie jsona
        console.log("User: " + username + " is trying to join room: " + roomName);
        roomID = roomName;
        socc.join(roomID); //()
        console.log("test1");
        serverplayers[socc.id] = new Player(socc.id); //adding player to list of players
        serverboards[roomID].player2 = serverplayers[socc.id]; //adding player to board
        serverboards[roomID].player2.nickname = username;
        console.log("New player:" + serverboards[roomID].player2.nickname + ", joined room: " + roomID);
        serverboards[roomID].startgame();
        serverboards[roomID].player1.printplayershand(); //prints players hand (just for test)
        serverboards[roomID].player2.printplayershand(); //prints players hand (just for test)
        serverboards[roomID].howmanytilesinstorage(); //prints how many tiles are left in storage
    });
    socket.on("exit", function (roomName, username) {
        console.log("Current players: " + serverplayers);
        serverboards.filter(function (e) { return e !== roomName; });
        serverplayers.filter(function (e) { return e !== username; });
        console.log("Current players: " + serverplayers);
    });
});
server.on("error", function (err) {
    console.log(err);
});
server.listen(8080, function () {
    console.log("Server is running on port 8080");
});
//tworzenie pokoju
//jeśli 2 gracze dołączyli to pojawia się guzik start
// jak go pacną to się odpali ta metoda ktora wygeneruje nowa plansze
//przypisze graczą ich kostki i rozpocznie "game loop"
//======== Game Models ========
var Game = /** @class */ (function () {
    function Game(board) {
        this.board = board;
    }
    Game.prototype.startgame = function () {
        this.board.GenerateEmptyBoard();
        this.board.filltilestorage();
        this.board.player1.fillplayershand(this.board.unusedtilestorage);
        this.board.player2.fillplayershand(this.board.unusedtilestorage);
        this.round = 0;
    };
    Game.prototype.gameloop = function () {
        if (this.gameover = false) {
            if (this.round % 2 === 1) {
                //player 1 turn 
            }
            else if (this.round % 2 === 0) {
                //player 2 turn
            }
        }
    };
    return Game;
}());
var Board = /** @class */ (function () {
    function Board(serverroomid) {
        this.gameboard = []; //type any because every other type created problems
        this.unusedtilestorage = []; //array storing lettertiles
        this.id = serverroomid;
        this.gameover = false;
    }
    Board.prototype.startgame = function () {
        this.GenerateEmptyBoard();
        this.filltilestorage();
        this.player1.fillplayershand(this.unusedtilestorage);
        this.player2.fillplayershand(this.unusedtilestorage);
    };
    Board.prototype.GenerateEmptyBoard = function () {
        //method generating board and filling it with empty tiles
        var rows = 15;
        var columns = 15;
        for (var row = 0; row < rows + 1; row++) {
            this.gameboard[row] = [
                new EmptyTile(),
                new EmptyTile(),
                new EmptyTile(),
                new EmptyTile(),
                new EmptyTile(),
                new EmptyTile(),
                new EmptyTile(),
                new EmptyTile(),
                new EmptyTile(),
                new EmptyTile(),
                new EmptyTile(),
                new EmptyTile(),
                new EmptyTile(),
                new EmptyTile(),
                new EmptyTile(),
            ];
        }
        console.log("board has been generated");
    };
    Board.prototype.PrintBoard = function () {
        //printing whole board in console (just for testing)
        var rows = 15;
        var columns = 15;
        for (var row = 0; row < rows + 1; row++) {
            console.log(this.gameboard[row][0].type, this.gameboard[row][1].type, this.gameboard[row][2].type, this.gameboard[row][3].type, this.gameboard[row][4].type, this.gameboard[row][5].type, this.gameboard[row][6].type, this.gameboard[row][7].type, this.gameboard[row][8].type, this.gameboard[row][9].type, this.gameboard[row][10].type, this.gameboard[row][11].type, this.gameboard[row][12].type, this.gameboard[row][13].type, this.gameboard[row][14].type);
        }
    };
    Board.prototype.howmanytilesinstorage = function () {
        //prints how many tiles are left in unusedtilestorage
        console.log(this.unusedtilestorage.length);
    };
    Board.prototype.filltilestorage = function () {
        //create an array of all letters with their values, state, id 
        this.unusedtilestorage.push(new LetterTile(0, 0, "Blank", 0), new LetterTile(1, 0, "Blank", 0), new LetterTile(2, 1, "A", 0), new LetterTile(3, 1, "A", 0), new LetterTile(4, 1, "A", 0), new LetterTile(5, 1, "A", 0), new LetterTile(6, 1, "A", 0), new LetterTile(7, 1, "A", 0), new LetterTile(8, 1, "A", 0), new LetterTile(9, 1, "A", 0), new LetterTile(10, 1, "A", 0), new LetterTile(11, 3, "B", 0), new LetterTile(12, 3, "B", 0), new LetterTile(13, 3, "C", 0), new LetterTile(14, 3, "C", 0), new LetterTile(15, 2, "D", 0), new LetterTile(16, 2, "D", 0), new LetterTile(17, 2, "D", 0), new LetterTile(18, 2, "D", 0), new LetterTile(19, 1, "E", 0), new LetterTile(20, 1, "E", 0), new LetterTile(21, 1, "E", 0), new LetterTile(22, 1, "E", 0), new LetterTile(23, 1, "E", 0), new LetterTile(24, 1, "E", 0), new LetterTile(25, 1, "E", 0), new LetterTile(26, 1, "E", 0), new LetterTile(27, 1, "E", 0), new LetterTile(28, 1, "E", 0), new LetterTile(29, 1, "E", 0), new LetterTile(30, 1, "E", 0), new LetterTile(31, 4, "F", 0), new LetterTile(32, 4, "F", 0), new LetterTile(33, 2, "G", 0), new LetterTile(34, 2, "G", 0), new LetterTile(35, 2, "G", 0), new LetterTile(36, 4, "H", 0), new LetterTile(37, 4, "H", 0), new LetterTile(38, 1, "I", 0), new LetterTile(39, 1, "I", 0), new LetterTile(40, 1, "I", 0), new LetterTile(41, 1, "I", 0), new LetterTile(42, 1, "I", 0), new LetterTile(43, 1, "I", 0), new LetterTile(44, 1, "I", 0), new LetterTile(45, 1, "I", 0), new LetterTile(46, 1, "I", 0), new LetterTile(47, 8, "J", 0), new LetterTile(48, 5, "K", 0), new LetterTile(49, 1, "L", 0), new LetterTile(50, 1, "L", 0), new LetterTile(51, 1, "L", 0), new LetterTile(52, 1, "L", 0), new LetterTile(53, 3, "M", 0), new LetterTile(54, 3, "M", 0), new LetterTile(55, 1, "N", 0), new LetterTile(56, 1, "N", 0), new LetterTile(57, 1, "N", 0), new LetterTile(58, 1, "N", 0), new LetterTile(59, 1, "N", 0), new LetterTile(60, 1, "N", 0), new LetterTile(61, 1, "O", 0), new LetterTile(62, 1, "O", 0), new LetterTile(63, 1, "O", 0), new LetterTile(64, 1, "O", 0), new LetterTile(65, 1, "O", 0), new LetterTile(66, 1, "O", 0), new LetterTile(67, 1, "O", 0), new LetterTile(68, 1, "O", 0), new LetterTile(69, 3, "P", 0), new LetterTile(70, 3, "P", 0), new LetterTile(71, 10, "Q", 0), new LetterTile(72, 1, "R", 0), new LetterTile(73, 1, "R", 0), new LetterTile(74, 1, "R", 0), new LetterTile(75, 1, "R", 0), new LetterTile(76, 1, "R", 0), new LetterTile(77, 1, "R", 0), new LetterTile(78, 1, "S", 0), new LetterTile(79, 1, "S", 0), new LetterTile(80, 1, "S", 0), new LetterTile(81, 1, "S", 0), new LetterTile(82, 1, "T", 0), new LetterTile(83, 1, "T", 0), new LetterTile(84, 1, "T", 0), new LetterTile(85, 1, "T", 0), new LetterTile(86, 1, "T", 0), new LetterTile(87, 1, "T", 0), new LetterTile(88, 1, "U", 0), new LetterTile(89, 1, "U", 0), new LetterTile(90, 1, "U", 0), new LetterTile(91, 1, "U", 0), new LetterTile(92, 4, "V", 0), new LetterTile(93, 4, "V", 0), new LetterTile(94, 4, "W", 0), new LetterTile(95, 4, "W", 0), new LetterTile(96, 8, "X", 0), new LetterTile(97, 4, "Y", 0), new LetterTile(98, 4, "Y", 0), new LetterTile(99, 10, "Z", 0));
    };
    return Board;
}());
var EmptyTile = /** @class */ (function () {
    function EmptyTile() {
        this.id = 0;
        this.type = "Empty";
        this.value = 0;
        this.status = 3;
    }
    return EmptyTile;
}());
var LetterTile = /** @class */ (function () {
    function LetterTile(id, value, type, status // TO DO
    ) {
        this.id = id;
        this.value = value;
        this.status = status;
        this.type = type;
    }
    return LetterTile;
}());
var Player = /** @class */ (function () {
    function Player(socketid //TO DO
    ) {
        this.playerhand = []; //array storing letters currently held by player
        this.playerhand = [];
        this.id = socketid;
        this.nickname = "Harold"; //If we have too much time we can add this functionality
        this.score = 0;
    }
    Player.prototype.printplayershand = function () {
        //prints players hand in console
        console.log("PLayer " + this.id + " has those tiles in hand:");
        for (var i = 0; i < this.playerhand.length; i++) {
            console.log(this.playerhand[i]);
        }
    };
    Player.prototype.fillplayershand = function (unusedtilestorage //used at start of game to give player tiles to play with
    ) {
        var my_div;
        var newDiv;
        var letter;
        var letterValue;
        for (var i = 0; i < 7; i++ //draws few tiles to fill players hand
        ) {
            var newtile = unusedtilestorage[Math.floor(Math.random() * unusedtilestorage.length)]; //find random tile from unusedtilestorage
            unusedtilestorage.splice(unusedtilestorage.indexOf(newtile), 1); //remove tile from unusedtilestorage
            newtile.status = 1; //because it lands in players hand
            this.playerhand.push(newtile);
            unusedtilestorage.splice(unusedtilestorage.indexOf(newtile), 1); //remove tile from unusedtilestorage
            //letter = serverplayers[socc.id].playerhand[1].type; //get letter from tile
            //letterValue =  serverplayers[this.playerhand.id].playerhand[1].value; //get value from tile
            // newDiv = document.createElement("div"); //generate div for the tile inside tile class
            // newDiv.innerHTML = '<div class="tile" id="tile_'+i+'"> <div class="letter">'+letter+'</div> <div class="letter-weight ">'+letterValue+'</div> </div>'; //Fill created div with generated tile
            // my_div = document.getElementById("stand");
            // document.body.insertBefore(newDiv, my_div);
        }
        console.log("Player's hand has been filled");
    };
    Player.prototype.tradetiles = function (chosentile, unusedtilestorage //TO DO removes tile chosen by player from his hand and gives him random one from unusedtilestorage
    ) {
        var index = this.playerhand
            .map(function (object) { return object.id; })
            .indexOf(chosentile.id); //find index of choesentile
        this.playerhand.splice(index, 1); //remove chosentile from players hand
        var newtile = unusedtilestorage[Math.floor(Math.random() * unusedtilestorage.length)]; //find random tile from unusedtilestorage
        unusedtilestorage.push(chosentile); //return tile to unusedtilestorage
        this.playerhand.push(newtile);
        console.log("Tile {0} has been removed from players hand and tile {1} has been added", chosentile.value, newtile.value);
    };
    Player.prototype.drawtile = function (unusedtilestorage //used at end of each round
    ) {
        var newtile = unusedtilestorage[Math.floor(Math.random() * unusedtilestorage.length)]; //find random tile from unusedtilestorage			
        unusedtilestorage.splice(unusedtilestorage.indexOf(newtile), 1); //remove tile from unusedtilestorage
        this.playerhand.push(newtile);
        console.log("TIle {0} has been added to players hand", newtile.value);
    };
    return Player;
}());
// class PlayerHand {
// 	 playerhand: LetterTile[] = []; //array storing letters currently held by player
// 	 fillplayershand(
// 		unusedtilestorage: Board["unusedtilestorage"] //used at start of game to give player tiles to play with
// 	) {
// 		for (
// 			var i: number = 0;
// 			i < 6;
// 			i++ //draws few tiles to fill players hand
// 		) {
// 			const newtile: LetterTile =
// 				unusedtilestorage[Math.floor(Math.random() * unusedtilestorage.length)]; //find random tile from unusedtilestorage
// 			this.playerhand.push(newtile);
// 		}
// 		console.log("Player's hand has been filled");
// 	}
// 	 tradetiles(
// 		chosentile: LetterTile,
// 		unusedtilestorage: Board["unusedtilestorage"] //TO DO removes tile chosen by player from his hand and gives him random one from unusedtilestorage
// 	) {
// 		const index = this.playerhand
// 			.map((object) => object.id)
// 			.indexOf(chosentile.id); //find index of choesentile
// 		this.playerhand.splice(index, 1); //remove chosentile from players hand
// 		const newtile: LetterTile =
// 			unusedtilestorage[Math.floor(Math.random() * unusedtilestorage.length)]; //find random tile from unusedtilestorage
// 		unusedtilestorage.push(chosentile); //return tile to unusedtilestorage
// 		this.playerhand.push(newtile);
// 		console.log(
// 			"Tile {0} has been removed from players hand and tile {1} has been added",
// 			chosentile.value,
// 			newtile.value
// 		);
// 	}
// 	 drawtile(
// 		unusedtilestorage: Board["unusedtilestorage"] //used at end of each round
// 	) {
// 		const newtile: LetterTile =
// 			unusedtilestorage[Math.floor(Math.random() * unusedtilestorage.length)]; //find random tile from unusedtilestorage
// 		this.playerhand.push(newtile);
// 		console.log("TIle {0} has been added to players hand", newtile.value);
// 	}
// }
// class UnusedTiles {
// 	unusedtilestorage: LetterTile[] = []; //array storing lettertiles
// 	//idk what else can be stored in this class
// 	filltilestorage() {
// 		//create an array of all letters with their values, state, id and ammount of avalaible tiles
// 		this.unusedtilestorage.push(
// 			new LetterTile(0, 0, "Blank", 0),
// 			new LetterTile(1, 0, "Blank", 0),
// 			new LetterTile(2, 1, "A", 0),
// 			new LetterTile(3, 1, "A", 0),
// 			new LetterTile(4, 1, "A", 0),
// 			new LetterTile(5, 1, "A", 0),
// 			new LetterTile(6, 1, "A", 0),
// 			new LetterTile(7, 1, "A", 0),
// 			new LetterTile(8, 1, "A", 0),
// 			new LetterTile(9, 1, "A", 0),
// 			new LetterTile(10, 1, "A", 0),
// 			new LetterTile(11, 3, "B", 0),
// 			new LetterTile(12, 3, "B", 0),
// 			new LetterTile(13, 3, "C", 0),
// 			new LetterTile(14, 3, "C", 0),
// 			new LetterTile(15, 2, "D", 0),
// 			new LetterTile(16, 2, "D", 0),
// 			new LetterTile(17, 2, "D", 0),
// 			new LetterTile(18, 2, "D", 0),
// 			new LetterTile(19, 1, "E", 0),
// 			new LetterTile(20, 1, "E", 0),
// 			new LetterTile(21, 1, "E", 0),
// 			new LetterTile(22, 1, "E", 0),
// 			new LetterTile(23, 1, "E", 0),
// 			new LetterTile(24, 1, "E", 0),
// 			new LetterTile(25, 1, "E", 0),
// 			new LetterTile(26, 1, "E", 0),
// 			new LetterTile(27, 1, "E", 0),
// 			new LetterTile(28, 1, "E", 0),
// 			new LetterTile(29, 1, "E", 0),
// 			new LetterTile(30, 1, "E", 0),
// 			new LetterTile(31, 4, "F", 0),
// 			new LetterTile(32, 4, "F", 0),
// 			new LetterTile(33, 2, "G", 0),
// 			new LetterTile(34, 2, "G", 0),
// 			new LetterTile(35, 2, "G", 0),
// 			new LetterTile(36, 4, "H", 0),
// 			new LetterTile(37, 4, "H", 0),
// 			new LetterTile(38, 1, "I", 0),
// 			new LetterTile(39, 1, "I", 0),
// 			new LetterTile(40, 1, "I", 0),
// 			new LetterTile(41, 1, "I", 0),
// 			new LetterTile(42, 1, "I", 0),
// 			new LetterTile(43, 1, "I", 0),
// 			new LetterTile(44, 1, "I", 0),
// 			new LetterTile(45, 1, "I", 0),
// 			new LetterTile(46, 1, "I", 0),
// 			new LetterTile(47, 8, "J", 0),
// 			new LetterTile(48, 5, "K", 0),
// 			new LetterTile(49, 1, "L", 0),
// 			new LetterTile(50, 1, "L", 0),
// 			new LetterTile(51, 1, "L", 0),
// 			new LetterTile(52, 1, "L", 0),
// 			new LetterTile(53, 3, "M", 0),
// 			new LetterTile(54, 3, "M", 0),
// 			new LetterTile(55, 1, "N", 0),
// 			new LetterTile(56, 1, "N", 0),
// 			new LetterTile(57, 1, "N", 0),
// 			new LetterTile(58, 1, "N", 0),
// 			new LetterTile(59, 1, "N", 0),
// 			new LetterTile(60, 1, "N", 0),
// 			new LetterTile(61, 1, "O", 0),
// 			new LetterTile(62, 1, "O", 0),
// 			new LetterTile(63, 1, "O", 0),
// 			new LetterTile(64, 1, "O", 0),
// 			new LetterTile(65, 1, "O", 0),
// 			new LetterTile(66, 1, "O", 0),
// 			new LetterTile(67, 1, "O", 0),
// 			new LetterTile(68, 1, "O", 0),
// 			new LetterTile(69, 3, "P", 0),
// 			new LetterTile(70, 3, "P", 0),
// 			new LetterTile(71, 10, "Q", 0),
// 			new LetterTile(72, 1, "R", 0),
// 			new LetterTile(73, 1, "R", 0),
// 			new LetterTile(74, 1, "R", 0),
// 			new LetterTile(75, 1, "R", 0),
// 			new LetterTile(76, 1, "R", 0),
// 			new LetterTile(77, 1, "R", 0),
// 			new LetterTile(78, 1, "S", 0),
// 			new LetterTile(79, 1, "S", 0),
// 			new LetterTile(80, 1, "S", 0),
// 			new LetterTile(81, 1, "S", 0),
// 			new LetterTile(82, 1, "T", 0),
// 			new LetterTile(83, 1, "T", 0),
// 			new LetterTile(84, 1, "T", 0),
// 			new LetterTile(85, 1, "T", 0),
// 			new LetterTile(86, 1, "T", 0),
// 			new LetterTile(87, 1, "T", 0),
// 			new LetterTile(88, 1, "U", 0),
// 			new LetterTile(89, 1, "U", 0),
// 			new LetterTile(90, 1, "U", 0),
// 			new LetterTile(91, 1, "U", 0),
// 			new LetterTile(92, 4, "V", 0),
// 			new LetterTile(93, 4, "V", 0),
// 			new LetterTile(94, 4, "W", 0),
// 			new LetterTile(95, 4, "W", 0),
// 			new LetterTile(96, 8, "X", 0),
// 			new LetterTile(97, 4, "Y", 0),
// 			new LetterTile(98, 4, "Y", 0),
// 			new LetterTile(99, 10, "Z", 0)
// 		);
// 	}
//}
