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
var roomID;
var serverplayers = [];
var serverboards = [];
var tempboards = [];
var boardnames = [];
io.on("connection", function (socket) {
    var socc = socket;
    io.emit("roomlist", boardnames);
    socket.emit("message", "Welcome to the game!");
    var playerid = socket.id;
    console.log("New player:" + socket.id + ", connected to server");
    //chat
    socket.on("message", function (text) {
        return io.emit("message", text);
    });
    //creating new room
    socket.on("newroom", function (username, roomName) {
        if (serverboards.some(function (e) { return e.id === roomName; })) {
            io.emit("message", "Room with this name allready exists");
            console.log("Room with this name allready exists");
        }
        else {
            roomID = roomName;
            console.log("Room: " + roomID + " was created");
            socc.join(roomID);
            console.log(username + " joined room: " + roomID);
            (serverboards[roomID] = new Board(roomID)),
                //add player to list of players & board
                (serverplayers[socc.id] = new Player(socc.id));
            serverboards[roomID].player1 = serverplayers[socc.id];
            serverboards[roomID].player1.nickname = username;
            boardnames.push(roomID);
            //create new board
            console.log("Owner of the room: " + serverboards[roomID].player1.nickname);
        }
    });
    //join existing room
    socket.on("joinroom", function (username, roomName) {
        // listen for incoming data msg on this newly connected socket
        console.log("User: " + username + " is trying to join room: " + roomName);
        roomID = roomName;
        socc.join(roomID); //()
        console.log("test1");
        serverplayers[socc.id] = new Player(socc.id); //adding player to list of players
        serverboards[roomID].player2 = serverplayers[socc.id]; //adding player to board
        serverboards[roomID].player2.nickname = username;
        boardnames.splice(serverboards.indexOf(serverboards[roomID], 1));
        console.log("New player:" +
            serverboards[roomID].player2.nickname +
            ", joined room: " +
            roomID);
        serverboards[roomID].startgame();
        if (serverboards[roomID].player2.nickname != "aezkami" &&
            serverboards[roomID].player1.nickname != "aezkami") {
            //validation if both players connected to room
            io.to(roomID).emit("startgame");
            console.log("startgame");
        }
    });
    socket.on("start", function (socket) {
        //if(serverboards[roomID].round == 0){
        serverboards[roomID].round++;
        io.to(roomID).emit("moveresponse", serverboards[roomID]);
    });
    socket.on("checkboard", function (localgameboard, hand1, hand2, thisplayer, otherplayer) {
        io.to(thisplayer).emit("waiting");
        io.to(otherplayer).emit("check");
        tempboards[roomID] = serverboards[roomID];
        tempboards[roomID].gameboard = localgameboard;
        tempboards[roomID].player1.playerhand = hand1;
        tempboards[roomID].player2.playerhand = hand2;
        tempboards[roomID].player1.fillplayershand(tempboards[roomID].unusedtilestorage);
        tempboards[roomID].player2.fillplayershand(tempboards[roomID].unusedtilestorage);
        tempboards[roomID].round++;
        var firsttile = tempboards[roomID].CheckForNewLetterIndex();
        if (firsttile) {
            console.log("first tile= " + firsttile.x + firsttile.y);
            //3 bcs we dont know direction it needs to go
            var indexes = tempboards[roomID].CheckForFirstLetterIndex(firsttile, 3); //TU SIĘ WYWALA PRZY 2 RUNDZIE
            console.log("indexes= " + indexes[0].x + indexes[0].y);
            if (thisplayer == tempboards[roomID].player1.id) {
                tempboards[roomID].CheckForWord(indexes[0], tempboards[roomID].player1);
                console.log(tempboards[roomID].player1.wordlist);
            }
            if (thisplayer == tempboards[roomID].player2.id) {
                tempboards[roomID].CheckForWord(indexes[0], tempboards[roomID].player2);
                console.log(tempboards[roomID].player2.wordlist);
            }
            tempboards[roomID].SaveLettersInBoard();
        }
        io.to(roomID).emit("moveresponse", tempboards[roomID]);
    });
    socket.on("acceptedWord", function (gameboard, thisplayer, otherplayer) {
        //odczytaj słowo
        //zlicz punkty
        //dodaj słowo i punkty do scoreboarda
        //kolejna tura
        //wyłącz waiting modal
        //zaaktualizuj board na sv
        serverboards[roomID] = tempboards[roomID];
        console.log("acceptedWord");
        io.to(roomID).emit("moveresponse", serverboards[roomID]);
        io.to(otherplayer).emit("stopWaiting");
        console.log(serverboards[roomID].round);
    });
    //sent current room list to client
    socket.on("refreshRooms", function () {
        io.emit("roomlist", boardnames, roomID);
    });
    socket.on("exit", function (roomName, username) {
        console.log("Current players: " + serverplayers);
        serverboards.filter(function (e) {
            return e !== roomName;
        });
        serverplayers.filter(function (e) {
            return e !== username;
        });
        console.log("Current players: " + serverplayers);
    });
});
server.on("error", function (err) {
    console.log(err);
});
server.listen(8080, function () {
    console.log("Server is running on port 8080");
});
//======== Game Models ========
var Board = /** @class */ (function () {
    function Board(serverroomid) {
        this.gameboard = []; //type any because every other type created problems
        this.unusedtilestorage = []; //array storing lettertiles
        this.id = serverroomid;
        this.gameover = false;
        this.round = -1;
    }
    Board.prototype.startgame = function () {
        this.GenerateEmptyBoard();
        this.filltilestorage();
        this.player1.fillplayershand(this.unusedtilestorage);
        this.player2.fillplayershand(this.unusedtilestorage);
    };
    Board.prototype.ChangeStatusTo3 = function (IndexI, IndexJ) {
        var newtile = this.gameboard[IndexI][IndexJ];
        newtile.status = 3;
        this.gameboard[IndexI][IndexJ] = newtile;
    };
    Board.prototype.CheckForWordVertical = function (x, player //TO DO
    ) {
        var IndexI = x.x;
        var IndexJ = x.y;
        var score = 0;
        var word = "";
        var conVertical = IndexI == 15 || this.gameboard[IndexI + 1][IndexJ].status == 4;
        var conHorizontal = IndexJ == 15 || this.gameboard[IndexI][IndexJ + 1].status == 4;
        while (true) {
            if (conVertical && (conHorizontal || (IndexI == x.x && IndexJ == x.y))) {
                //no way to move
                word += this.gameboard[IndexI][IndexJ].type;
                score += this.gameboard[IndexI][IndexJ].value;
                this.ChangeStatusTo3(IndexI, IndexJ);
                break;
            }
            if (conVertical ||
                (this.gameboard[IndexI][IndexJ].status == 2 &&
                    IndexI != x.x &&
                    IndexJ != x.y)) {
                //only horizontal
                word += this.gameboard[IndexI][IndexJ].type;
                score += this.gameboard[IndexI][IndexJ].value;
                this.ChangeStatusTo3(IndexI, IndexJ);
                this.CheckForWord(this.CheckForFirstLetterIndex(new coordiantes(IndexI, IndexJ), 0)[0], player);
                break;
            }
            if (conHorizontal || this.gameboard[IndexI][IndexJ].status == 3) {
                //only vertical
                word += this.gameboard[IndexI][IndexJ].type;
                score += this.gameboard[IndexI][IndexJ].value;
                this.ChangeStatusTo3(IndexI, IndexJ);
                IndexI += 1;
                break;
            } //horizontal and vertical
            else {
                word += this.gameboard[IndexI][IndexJ].type;
                score += this.gameboard[IndexI][IndexJ].value;
                this.ChangeStatusTo3(IndexI, IndexJ);
                this.CheckForWord(this.CheckForFirstLetterIndex(new coordiantes(IndexI, IndexJ), 0)[0], player);
                IndexI += 1;
            }
        }
        if (word.length > 1) {
            console.log(score);
            player.score += score;
            player.wordlist.push(word);
        }
    };
    Board.prototype.CheckForWord = function (x, player //checks for words starting from given coordinates
    ) {
        var IndexI = x.x;
        var IndexJ = x.y;
        var score = 0;
        var word = "";
        while (true) {
            var conVertical = IndexI == 15 || this.gameboard[IndexI + 1][IndexJ].status == 4;
            var conHorizontal = IndexJ == 15 || this.gameboard[IndexI][IndexJ + 1].status == 4;
            if (conVertical && this.gameboard[IndexI][IndexJ].status < 4) {
                //only horizontal
                word += this.gameboard[IndexI][IndexJ].type;
                score += this.gameboard[IndexI][IndexJ].value;
                console.log(word);
                IndexJ += 1;
            }
            else if (conHorizontal && this.gameboard[IndexI][IndexJ].status < 4) {
                //only vertical
                word += this.gameboard[IndexI][IndexJ].type;
                score += this.gameboard[IndexI][IndexJ].value;
                console.log(word);
                IndexI += 1;
            }
            else if (!conHorizontal && !conVertical) {
                //horizontal and vertical
                word += this.gameboard[IndexI][IndexJ].type;
                score += this.gameboard[IndexI][IndexJ].value;
                console.log(word);
                this.CheckForWord(this.CheckForFirstLetterIndex(new coordiantes(IndexI, IndexJ), 2)[0], player);
                IndexJ += 1;
            }
            else {
                break;
            }
        }
        if (word.length > 1) {
            player.score += score;
            player.wordlist.push(word);
        }
    };
    Board.prototype.CheckForFirstLetterIndex = function (x, direction) {
        // initialize with 3 when we dont know directions // initialize with 2 to find only vertical words // initialize with 1 that means its first use of this function and it will check if leters are in vertical and horizontal alignment // initialize with 0 to find only horizontal words //this function finds index of firstletter of word (or two words than output contains 2 coordinates )
        var IndexI = x.x;
        var IndexJ = x.y;
        while (true) {
            var conVertical = IndexI == 0 || this.gameboard[IndexI - 1][IndexJ].status === 4;
            var conHorizontal = IndexJ == 0 || this.gameboard[IndexI][IndexJ - 1].status === 4;
            if (conVertical && conHorizontal)
                break;
            if (direction == 3) {
                if (!conVertical && !conHorizontal) {
                    direction = 1;
                }
                else if (!conVertical) {
                    direction = 2;
                }
                else {
                    direction = 0;
                }
                console.log("Direction= " + direction);
            }
            if (direction == 0) {
                //only horizontal
                if (conHorizontal)
                    //no way way to move
                    break;
                IndexJ -= 1;
            }
            if (direction == 1) {
                //horizontal and vertical
                var horizontaloutput = this.CheckForFirstLetterIndex(x, 0);
                var verticaloutput = this.CheckForFirstLetterIndex(x, 2);
                return [horizontaloutput[0], verticaloutput[0]];
            }
            if (direction == 2) {
                //only vertical
                if (conVertical)
                    break;
                console.log("cojes= " + IndexI + IndexJ);
                IndexI -= 1;
            }
        }
        return [new coordiantes(IndexI, IndexJ)];
    };
    Board.prototype.CheckForNewLetterIndex = function () {
        // this method finds index of letter with lowest index that was newly added to board
        for (var i = 0; i < 15; i++) {
            for (var j = 0; j < 15; j++) {
                if (this.gameboard[i][j].status == 2) {
                    return new coordiantes(i, j);
                }
            }
        }
    };
    Board.prototype.SaveLettersInBoard = function () {
        //changes status of new letters to 3
        for (var i = 0; i < 15; i++) {
            for (var j = 0; j < 15; j++) {
                if (this.gameboard[i][j].status == 2) {
                    var newtile = this.gameboard[i][j];
                    newtile.status = 3;
                    this.gameboard[i][j] = newtile;
                }
            }
        }
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
        this.unusedtilestorage.push(new LetterTile(0, 0, "-", 0), new LetterTile(1, 0, "-", 0), new LetterTile(2, 1, "A", 0), new LetterTile(3, 1, "A", 0), new LetterTile(4, 1, "A", 0), new LetterTile(5, 1, "A", 0), new LetterTile(6, 1, "A", 0), new LetterTile(7, 1, "A", 0), new LetterTile(8, 1, "A", 0), new LetterTile(9, 1, "A", 0), new LetterTile(10, 1, "A", 0), new LetterTile(11, 3, "B", 0), new LetterTile(12, 3, "B", 0), new LetterTile(13, 3, "C", 0), new LetterTile(14, 3, "C", 0), new LetterTile(15, 2, "D", 0), new LetterTile(16, 2, "D", 0), new LetterTile(17, 2, "D", 0), new LetterTile(18, 2, "D", 0), new LetterTile(19, 1, "E", 0), new LetterTile(20, 1, "E", 0), new LetterTile(21, 1, "E", 0), new LetterTile(22, 1, "E", 0), new LetterTile(23, 1, "E", 0), new LetterTile(24, 1, "E", 0), new LetterTile(25, 1, "E", 0), new LetterTile(26, 1, "E", 0), new LetterTile(27, 1, "E", 0), new LetterTile(28, 1, "E", 0), new LetterTile(29, 1, "E", 0), new LetterTile(30, 1, "E", 0), new LetterTile(31, 4, "F", 0), new LetterTile(32, 4, "F", 0), new LetterTile(33, 2, "G", 0), new LetterTile(34, 2, "G", 0), new LetterTile(35, 2, "G", 0), new LetterTile(36, 4, "H", 0), new LetterTile(37, 4, "H", 0), new LetterTile(38, 1, "I", 0), new LetterTile(39, 1, "I", 0), new LetterTile(40, 1, "I", 0), new LetterTile(41, 1, "I", 0), new LetterTile(42, 1, "I", 0), new LetterTile(43, 1, "I", 0), new LetterTile(44, 1, "I", 0), new LetterTile(45, 1, "I", 0), new LetterTile(46, 1, "I", 0), new LetterTile(47, 8, "J", 0), new LetterTile(48, 5, "K", 0), new LetterTile(49, 1, "L", 0), new LetterTile(50, 1, "L", 0), new LetterTile(51, 1, "L", 0), new LetterTile(52, 1, "L", 0), new LetterTile(53, 3, "M", 0), new LetterTile(54, 3, "M", 0), new LetterTile(55, 1, "N", 0), new LetterTile(56, 1, "N", 0), new LetterTile(57, 1, "N", 0), new LetterTile(58, 1, "N", 0), new LetterTile(59, 1, "N", 0), new LetterTile(60, 1, "N", 0), new LetterTile(61, 1, "O", 0), new LetterTile(62, 1, "O", 0), new LetterTile(63, 1, "O", 0), new LetterTile(64, 1, "O", 0), new LetterTile(65, 1, "O", 0), new LetterTile(66, 1, "O", 0), new LetterTile(67, 1, "O", 0), new LetterTile(68, 1, "O", 0), new LetterTile(69, 3, "P", 0), new LetterTile(70, 3, "P", 0), new LetterTile(71, 10, "Q", 0), new LetterTile(72, 1, "R", 0), new LetterTile(73, 1, "R", 0), new LetterTile(74, 1, "R", 0), new LetterTile(75, 1, "R", 0), new LetterTile(76, 1, "R", 0), new LetterTile(77, 1, "R", 0), new LetterTile(78, 1, "S", 0), new LetterTile(79, 1, "S", 0), new LetterTile(80, 1, "S", 0), new LetterTile(81, 1, "S", 0), new LetterTile(82, 1, "T", 0), new LetterTile(83, 1, "T", 0), new LetterTile(84, 1, "T", 0), new LetterTile(85, 1, "T", 0), new LetterTile(86, 1, "T", 0), new LetterTile(87, 1, "T", 0), new LetterTile(88, 1, "U", 0), new LetterTile(89, 1, "U", 0), new LetterTile(90, 1, "U", 0), new LetterTile(91, 1, "U", 0), new LetterTile(92, 4, "V", 0), new LetterTile(93, 4, "V", 0), new LetterTile(94, 4, "W", 0), new LetterTile(95, 4, "W", 0), new LetterTile(96, 8, "X", 0), new LetterTile(97, 4, "Y", 0), new LetterTile(98, 4, "Y", 0), new LetterTile(99, 10, "Z", 0));
    };
    return Board;
}());
var EmptyTile = /** @class */ (function () {
    function EmptyTile() {
        this.id = 0;
        this.type = "Empty";
        this.value = 0;
        this.status = 4;
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
        this.wordlist = []; //contains list of accepted words
        this.playerhand = [];
        this.id = socketid;
        this.nickname = "aezkami"; //If we have too much time we can add this functionality
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
        for (var i = this.playerhand.length; i < 7; i++ //draws few tiles to fill players hand
        ) {
            var newtile = unusedtilestorage[Math.floor(Math.random() * unusedtilestorage.length)]; //find random tile from unusedtilestorage
            unusedtilestorage.splice(unusedtilestorage.indexOf(newtile), 1); //remove tile from unusedtilestorage
            newtile.status = 1; //because it lands in players hand
            this.playerhand.push(newtile);
            unusedtilestorage.splice(unusedtilestorage.indexOf(newtile), 1); //remove tile from unusedtilestorage
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
var coordiantes = /** @class */ (function () {
    function coordiantes(x, y) {
        this.x = x;
        this.y = y;
    }
    return coordiantes;
}());
