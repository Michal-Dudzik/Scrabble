import { Socket } from "socket.io";

const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const app = express();
app.use(express.static("./frontend")); //connection to frontend side
const server = http.createServer(app);
const io = socketio(server);

// ======== SERVER STUFF ========

// potrzbne to?
let clientNo = 0;

let roomID;
let serverplayers: Player[] = [];
let serverboards: Board[] = [];
let boardnames: string[] = [];
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
		if (serverboards.some((e) => e.id === roomName)) {
			io.emit("message", "Room with this name allready exists");
			console.log("Room with this name allready exists");
		} else {
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
			console.log(
				"Owner of the room: " + serverboards[roomID].player1.nickname
			);
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
		console.log(
			"New player:" +
				serverboards[roomID].player2.nickname +
				", joined room: " +
				roomID
		);
		serverboards[roomID].startgame();
		console.log("jebać ulane kurwy");
		if (
			serverboards[roomID].player2.nickname != "aezkami" &&
			serverboards[roomID].player1.nickname != "aezkami"
		) {
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
	socket.on("checkboard", function (localgameboard,hand1, hand2, thisplayer, otherplayer) {
		io.to(thisplayer).emit("waiting");
		io.to(otherplayer).emit("check");
		let tempboard: Board = serverboards[roomID];	
		tempboard.gameboard = localgameboard;
		tempboard.player1.playerhand = hand1;
		tempboard.player2.playerhand = hand2;
		tempboard.player1.fillplayershand(serverboards[roomID].unusedtilestorage);
		tempboard.player2.fillplayershand(serverboards[roomID].unusedtilestorage);
		let firsttile : any = tempboard.CheckForNewLetterIndex();
		if(firsttile)
		{
			console.log("first tile= " + firsttile.x + firsttile.y);
			let indexes: coordiantes[] = tempboard.CheckForFirstLetterIndex(firsttile, 1)
			console.log("indexes= " + indexes[0].x + indexes[0].y)
			// if(indexes.length > 1)
			// {
				
			// }
			if(thisplayer == tempboard.player1.id)
			{
			tempboard.CheckForWord(indexes[0], tempboard.player1);	
			console.log(tempboard.player1.wordlist);
			}
			if(thisplayer == tempboard.player2.id)
			{
			tempboard.CheckForWord(indexes[0], tempboard.player2);	
			console.log(tempboard.player2.wordlist);
			}
		}
		io.to(roomID).emit("moveresponse", tempboard);		
	});

	socket.on("acceptedWord", function (gameboard, thisplayer, otherplayer) {
		//odczytaj słowo
		//zlicz punkty
		//dodaj słowo i punkty do scoreboarda
		//kolejna tura
		//wyłącz waiting modal
		//zaaktualizuj board na sv
		console.log("acceptedWord");
		io.to(roomID).emit("moveresponse", gameboard);
		io.to(otherplayer).emit("stopWaiting");
		
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


class Board {
	//this class may be split in to few different classes but only if we have time for that
	id: string;
	gameboard: ITile[][] = []; //type any because every other type created problems
	player1: Player;
	player2: Player; //list of player id's that are currently playing
	unusedtilestorage: LetterTile[] = []; //array storing lettertiles
	gameover: boolean; //false = game continues || true = game is finished
	round: number; //allows to count rounds
	constructor(serverroomid: string) {
		this.id = serverroomid;
		this.gameover = false;
	}
	startgame() {
		this.GenerateEmptyBoard();
		this.filltilestorage();
		this.player1.fillplayershand(this.unusedtilestorage);
		this.player2.fillplayershand(this.unusedtilestorage);
	}
	public ChangeStatusTo3(IndexI, IndexJ)
	{
		let newtile: any = this.gameboard[IndexI][IndexJ];
		newtile.status = 3;	
		this.gameboard[IndexI][IndexJ] = newtile;
	}
	public CheckForWordVertical(x:coordiantes, player: Player) //TO DO
	{		

		let IndexI:number = x.x;
		let IndexJ:number = x.y;	
		let score: number = 0;
		let word: string = "";	
		var conVertical = IndexI == 15 || this.gameboard[IndexI + 1][IndexJ].status == 4;
		var conHorizontal = IndexJ == 15 || this.gameboard[IndexI][IndexJ + 1].status == 4;

		while(true)
		{
			if(conVertical && (conHorizontal || (IndexI == x.x && IndexJ == x.y))) //no way to move
			{
				word += this.gameboard[IndexI][IndexJ].type;
				score += this.gameboard[IndexI][IndexJ].value;							
				this.ChangeStatusTo3(IndexI,IndexJ);
				break;
			}			
			if(conVertical || this.gameboard[IndexI][IndexJ].status == 2 && IndexI != x.x && IndexJ != x.y)//only horizontal
			{
				word += this.gameboard[IndexI][IndexJ].type;
				score += this.gameboard[IndexI][IndexJ].value;
				this.ChangeStatusTo3(IndexI,IndexJ);
				this.CheckForWord(this.CheckForFirstLetterIndex(new coordiantes(IndexI,IndexJ),0)[0], player);
				break;
			}
			if(conHorizontal || this.gameboard[IndexI][IndexJ].status == 3 )//only vertical
			{
				word += this.gameboard[IndexI][IndexJ].type;
				score += this.gameboard[IndexI][IndexJ].value;
				this.ChangeStatusTo3(IndexI,IndexJ);
				IndexI += 1;
				break;
			}
			else //horizontal and vertical
			{
				word += this.gameboard[IndexI][IndexJ].type;
				score += this.gameboard[IndexI][IndexJ].value;
				this.ChangeStatusTo3(IndexI,IndexJ);
				this.CheckForWord(this.CheckForFirstLetterIndex(new coordiantes(IndexI,IndexJ),0)[0], player);				
				IndexI += 1;
			}
			
		}
		if(word.length > 1){
			player.score += score;
			player.wordlist.push(word);
			}
	}
	public CheckForWord(x:coordiantes, player: Player)
	 //checks for words starting from given coordinates
	{	
		let IndexI:number = x.x;
		let IndexJ:number = x.y;	
		let score: number = 0;
		let word: string = "";	
		var conVertical = IndexI == 15 || this.gameboard[IndexI + 1][IndexJ].status == 4;
		var conHorizontal = IndexJ == 15 || this.gameboard[IndexI][IndexJ + 1].status == 4;
		
        while (true) {

            if (conVertical && this.gameboard[IndexI][IndexJ].status < 4) //only horizontal
             {
                word += this.gameboard[IndexI][IndexJ].type;
                score += this.gameboard[IndexI][IndexJ].value;
                console.log(word);
                IndexJ += 1;
            }
            else if (conHorizontal && this.gameboard[IndexI][IndexJ].status < 4) //only vertical
            {
                word += this.gameboard[IndexI][IndexJ].type;
                score += this.gameboard[IndexI][IndexJ].value;
                console.log(word);
                IndexI += 1;
            }
            else if (!conHorizontal && !conVertical)//horizontal and vertical
            {
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

	}
	public CheckForFirstLetterIndex(x:coordiantes, direction:number) :coordiantes[] 
	//this function finds index of firstletter of word (or two words than output contains 2 coordinates )
	// initialize with 0 to find only horizontal words
	// initialize with 1 that means its first use of this function and it will check if leters are in vertical and horizontal alignment 
	// initialize with 2 to find only vertical words
	// initialize with 3 when we dont know directions
	{		
		let IndexI:number = x.x;
		let IndexJ:number = x.y;
		
		var conVertical = IndexI == 0 || this.gameboard[IndexI - 1][IndexJ].status == 4;
		var conHorizontal = IndexJ == 0 || this.gameboard[IndexI][IndexJ - 1].status == 4;	
		
			while(true)
			{
				if(conVertical && conHorizontal)
					break;		
				if(direction == 3)
				{
					if(!conVertical && !conHorizontal)
					{
						direction = 1;
					}
					else if(!conVertical)
					{
						direction = 2;
					}
					else
					{
						direction = 0;
					}
				}
				if(direction == 0) //only horizontal
				{
					if(conHorizontal) //no way way to move
						break;	

					IndexJ -= 1;				
				}			
				
				if(direction == 1) //horizontal and vertical
				{
					var horizontaloutput = this.CheckForFirstLetterIndex(x, 0);
					var verticaloutput = this.CheckForFirstLetterIndex(x, 2);
					return([horizontaloutput[0], verticaloutput[0]]);
				}

				if(direction == 2) //only vertical
				{
					if(conVertical)
						break;

					IndexI -= 1;
				}				
			}
			return([new coordiantes(IndexI, IndexJ)]);
	}
	public CheckForNewLetterIndex()// this method finds index of letter with lowest index that was newly added to board
	{
		for (var i = 0; i < 15; i++) {
			for (var j = 0; j < 15; j++) {			
												
					if(this.gameboard[i][j].status == 2)
					{											 		
																						
						return(new coordiantes(i,j));						
					}												
				} 
			}
			
	}
	public SaveLettersInBoard() //changes status of new letters to 3
	{
		for (var i = 0; i < 15; i++) {
			for (var j = 0; j < 15; j++) {			
												
					if(this.gameboard[i][j].status == 2)
					{											 		
						let newtile: any = this.gameboard[i][j];
						newtile.status = 3;						
						this.gameboard[i][j] = newtile;
						
					}												
				} 
			}
	}
	public GenerateEmptyBoard() {
		//method generating board and filling it with empty tiles
		const rows: number = 15;
		const columns: number = 15;
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
	}
	public PrintBoard() {
		//printing whole board in console (just for testing)
		const rows: number = 15;
		const columns: number = 15;
		for (var row = 0; row < rows + 1; row++) {
			console.log(
				this.gameboard[row][0].type,
				this.gameboard[row][1].type,
				this.gameboard[row][2].type,
				this.gameboard[row][3].type,
				this.gameboard[row][4].type,
				this.gameboard[row][5].type,
				this.gameboard[row][6].type,
				this.gameboard[row][7].type,
				this.gameboard[row][8].type,
				this.gameboard[row][9].type,
				this.gameboard[row][10].type,
				this.gameboard[row][11].type,
				this.gameboard[row][12].type,
				this.gameboard[row][13].type,
				this.gameboard[row][14].type
			);
		}
	}
	howmanytilesinstorage() {
		//prints how many tiles are left in unusedtilestorage
		console.log(this.unusedtilestorage.length);
	}
	filltilestorage() {
		//create an array of all letters with their values, state, id
		this.unusedtilestorage.push(
			new LetterTile(0, 0, "Blank", 0),
			new LetterTile(1, 0, "Blank", 0),
			new LetterTile(2, 1, "A", 0),
			new LetterTile(3, 1, "A", 0),
			new LetterTile(4, 1, "A", 0),
			new LetterTile(5, 1, "A", 0),
			new LetterTile(6, 1, "A", 0),
			new LetterTile(7, 1, "A", 0),
			new LetterTile(8, 1, "A", 0),
			new LetterTile(9, 1, "A", 0),
			new LetterTile(10, 1, "A", 0),
			new LetterTile(11, 3, "B", 0),
			new LetterTile(12, 3, "B", 0),
			new LetterTile(13, 3, "C", 0),
			new LetterTile(14, 3, "C", 0),
			new LetterTile(15, 2, "D", 0),
			new LetterTile(16, 2, "D", 0),
			new LetterTile(17, 2, "D", 0),
			new LetterTile(18, 2, "D", 0),
			new LetterTile(19, 1, "E", 0),
			new LetterTile(20, 1, "E", 0),
			new LetterTile(21, 1, "E", 0),
			new LetterTile(22, 1, "E", 0),
			new LetterTile(23, 1, "E", 0),
			new LetterTile(24, 1, "E", 0),
			new LetterTile(25, 1, "E", 0),
			new LetterTile(26, 1, "E", 0),
			new LetterTile(27, 1, "E", 0),
			new LetterTile(28, 1, "E", 0),
			new LetterTile(29, 1, "E", 0),
			new LetterTile(30, 1, "E", 0),
			new LetterTile(31, 4, "F", 0),
			new LetterTile(32, 4, "F", 0),
			new LetterTile(33, 2, "G", 0),
			new LetterTile(34, 2, "G", 0),
			new LetterTile(35, 2, "G", 0),
			new LetterTile(36, 4, "H", 0),
			new LetterTile(37, 4, "H", 0),
			new LetterTile(38, 1, "I", 0),
			new LetterTile(39, 1, "I", 0),
			new LetterTile(40, 1, "I", 0),
			new LetterTile(41, 1, "I", 0),
			new LetterTile(42, 1, "I", 0),
			new LetterTile(43, 1, "I", 0),
			new LetterTile(44, 1, "I", 0),
			new LetterTile(45, 1, "I", 0),
			new LetterTile(46, 1, "I", 0),
			new LetterTile(47, 8, "J", 0),
			new LetterTile(48, 5, "K", 0),
			new LetterTile(49, 1, "L", 0),
			new LetterTile(50, 1, "L", 0),
			new LetterTile(51, 1, "L", 0),
			new LetterTile(52, 1, "L", 0),
			new LetterTile(53, 3, "M", 0),
			new LetterTile(54, 3, "M", 0),
			new LetterTile(55, 1, "N", 0),
			new LetterTile(56, 1, "N", 0),
			new LetterTile(57, 1, "N", 0),
			new LetterTile(58, 1, "N", 0),
			new LetterTile(59, 1, "N", 0),
			new LetterTile(60, 1, "N", 0),
			new LetterTile(61, 1, "O", 0),
			new LetterTile(62, 1, "O", 0),
			new LetterTile(63, 1, "O", 0),
			new LetterTile(64, 1, "O", 0),
			new LetterTile(65, 1, "O", 0),
			new LetterTile(66, 1, "O", 0),
			new LetterTile(67, 1, "O", 0),
			new LetterTile(68, 1, "O", 0),
			new LetterTile(69, 3, "P", 0),
			new LetterTile(70, 3, "P", 0),
			new LetterTile(71, 10, "Q", 0),
			new LetterTile(72, 1, "R", 0),
			new LetterTile(73, 1, "R", 0),
			new LetterTile(74, 1, "R", 0),
			new LetterTile(75, 1, "R", 0),
			new LetterTile(76, 1, "R", 0),
			new LetterTile(77, 1, "R", 0),
			new LetterTile(78, 1, "S", 0),
			new LetterTile(79, 1, "S", 0),
			new LetterTile(80, 1, "S", 0),
			new LetterTile(81, 1, "S", 0),
			new LetterTile(82, 1, "T", 0),
			new LetterTile(83, 1, "T", 0),
			new LetterTile(84, 1, "T", 0),
			new LetterTile(85, 1, "T", 0),
			new LetterTile(86, 1, "T", 0),
			new LetterTile(87, 1, "T", 0),
			new LetterTile(88, 1, "U", 0),
			new LetterTile(89, 1, "U", 0),
			new LetterTile(90, 1, "U", 0),
			new LetterTile(91, 1, "U", 0),
			new LetterTile(92, 4, "V", 0),
			new LetterTile(93, 4, "V", 0),
			new LetterTile(94, 4, "W", 0),
			new LetterTile(95, 4, "W", 0),
			new LetterTile(96, 8, "X", 0),
			new LetterTile(97, 4, "Y", 0),
			new LetterTile(98, 4, "Y", 0),
			new LetterTile(99, 10, "Z", 0)
		);
	}
}

interface ITile {

	readonly type: string; // 0 = empty else its letter (A = 1, B = 2...)
	readonly value: number;
	readonly status: number; // 0 = tile in storage / 1 = tile is in player's hand / 2 = tile is on gameboard during acceptance phase / 3 = tile is placed on board / 4 if its empty tile
}

class EmptyTile implements ITile {
	public id: number;
	readonly type: string; // 0 = empty tile
	readonly value: number; // 0 = empty tile
	public status: number; // 4 because its empty tile)
	public constructor() {
		this.id = 0;
		this.type = "Empty";
		this.value = 0;
		this.status = 4;
	}
}

class LetterTile implements ITile {
	readonly type: string; // A = 1, B = 2 etc
	readonly value: number; // value of tile that is used in counting score
	public status: number;
	public id: number; // every letter tile has its unique id

	public constructor(
		id: number,
		value: number,
		type: string,
		status: number // TO DO
	) {
		this.id = id;
		this.value = value;
		this.status = status;
		this.type = type;
	}
}

class Player {
	id: string; //value by which player can be recognized
	nickname: string; //can be set by player but doesnt serve any bigger reason
	playerhand: LetterTile[] = []; //array storing letters currently held by player
	score: number;
	wordlist: string[] = []; //contains list of accepted words
	constructor(
		socketid: string //TO DO
	) {
		this.playerhand = [];
		this.id = socketid;
		this.nickname = "aezkami"; //If we have too much time we can add this functionality
		this.score = 0;
	}
	printplayershand() {
		//prints players hand in console
		console.log("PLayer " + this.id + " has those tiles in hand:");
		for (var i: number = 0; i < this.playerhand.length; i++) {
			console.log(this.playerhand[i]);
		}
	}
	fillplayershand(
		unusedtilestorage: Board["unusedtilestorage"] //used at start of game to give player tiles to play with
	) {		

		for (
			var i: number = this.playerhand.length;
			i < 7;
			i++ //draws few tiles to fill players hand
		) {
			const newtile: LetterTile =
				unusedtilestorage[Math.floor(Math.random() * unusedtilestorage.length)]; //find random tile from unusedtilestorage
			unusedtilestorage.splice(unusedtilestorage.indexOf(newtile), 1); //remove tile from unusedtilestorage
			newtile.status = 1; //because it lands in players hand
			this.playerhand.push(newtile);
			unusedtilestorage.splice(unusedtilestorage.indexOf(newtile), 1); //remove tile from unusedtilestorage

			
		}
		console.log("Player's hand has been filled");
	}
	tradetiles(
		chosentile: LetterTile,
		unusedtilestorage: Board["unusedtilestorage"] //TO DO removes tile chosen by player from his hand and gives him random one from unusedtilestorage
	) {
		const index = this.playerhand
			.map((object) => object.id)
			.indexOf(chosentile.id); //find index of choesentile
		this.playerhand.splice(index, 1); //remove chosentile from players hand
		const newtile: LetterTile =
			unusedtilestorage[Math.floor(Math.random() * unusedtilestorage.length)]; //find random tile from unusedtilestorage
		unusedtilestorage.push(chosentile); //return tile to unusedtilestorage
		this.playerhand.push(newtile);
		console.log(
			"Tile {0} has been removed from players hand and tile {1} has been added",
			chosentile.value,
			newtile.value
		);
	}
	drawtile(
		unusedtilestorage: Board["unusedtilestorage"] //used at end of each round
	) {
		const newtile: LetterTile =
			unusedtilestorage[Math.floor(Math.random() * unusedtilestorage.length)]; //find random tile from unusedtilestorage
		unusedtilestorage.splice(unusedtilestorage.indexOf(newtile), 1); //remove tile from unusedtilestorage
		this.playerhand.push(newtile);
		console.log("TIle {0} has been added to players hand", newtile.value);
	}
}
class coordiantes
{
	x: number;
	y: number;
	constructor(x:number, y:number)
	{
		this.x = x;
		this.y = y;
	}
}