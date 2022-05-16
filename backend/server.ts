const express = require("express");
const app = express();
const io = require("socket.io")(5500);

// ======== SERVER STUFF ========

app.get("/", (req, res) => res.send("Hello World!"));

let clientNo = 0;
let roomNo;
let serverplayers: Player[] = [];
let serverboards: Board[] = [];
io.on("connection", connected);
//setInterval(serverLoop, 1000/60); //not sure if needed
function connected(socket) {
	//function that initiates when player connects
	clientNo++;
	roomNo = Math.round(clientNo / 2); //assigning 2 players to rooms
	socket.join(roomNo);
	console.log("New player:" + clientNo + ", joined room: " + roomNo);
	if (clientNo % 2 === 1) {
		//creating player 1
		serverplayers[socket.id] = new Player(socket.id); //adding player to list of players
		serverboards[roomNo] = new Board(roomNo); //creating new board
		serverboards[roomNo].player1 = serverplayers[socket.id]; //adding player to board
		console.log("Player: " + socket.id + " was asigned to board and his nick is: " + serverboards[roomNo].player1.nickname);
	} else if (clientNo % 2 === 0) {
		//creating player 2
		serverplayers[socket.id] = new Player(socket.id); //adding player to list of players
		serverboards[roomNo].player2 = serverplayers[socket.id]; //adding player to board
		console.log("Player: " + socket.id +" was asigned to board and his nick is: " +	serverboards[roomNo].player2.nickname);
		serverboards[roomNo].GenerateEmptyBoard(); //generating empty board
		//serverboards[roomNo].PrintBoard(); //prints board (just for test)
		serverboards[roomNo].filltilestorage(); //filling tilestorage with tiles
		serverboards[roomNo].player1.fillplayershand(serverboards[roomNo].unusedtilestorage)
		serverboards[roomNo].player2.fillplayershand(serverboards[roomNo].unusedtilestorage)
		serverboards[roomNo].player1.printplayershand()//prints players hand (just for test)
		serverboards[roomNo].player2.printplayershand()//prints players hand (just for test)
		serverboards[roomNo].howmanytilesinstorage()//prints how many tiles are left in storage
	}
	socket.on("disconnect", function () {
		//TODO usuniecie gracza z gry
	});
}
//tworzenie pokoju
//jeśli 2 gracze dołączyli to pojawia się guzik start
// jak go pacną to się odpali ta metoda ktora wygeneruje nowa plansze
//przypisze graczą ich kostki i rozpocznie "game loop"

//======== Game Models ========

class Board {
	id: string;
	gameboard: ITile[][] = []; //type any because every other type created problems
	player1: Player;
	player2: Player; //list of player id's that are currently playing
	unusedtilestorage: LetterTile[] = []; //array storing lettertiles
	//idk what else can be stored in this class
	constructor(serverroomid: string) {
		this.id = serverroomid;
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
	howmanytilesinstorage(){//prints how many tiles are left in unusedtilestorage
	//	for(var i: number = 0; i < this.unusedtilestorage.length; i++){}
	console.log(this.unusedtilestorage.length)
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
	readonly status: number; // 0 = tile in storage / 1 = tile is in player's hand / 2 = tile is on gameboard during acceptance phase / 3 = tile is placed on board
}

class EmptyTile implements ITile {
	public id: number;
	readonly type: string; // 0 = empty tile
	readonly value: number; // 0 = empty tile
	public status: number; // 3 because empty tile can only apear on gameboard during board generation / 4 if tile contains bonus (probably wont be implemented)
	public constructor() {
		this.id = 0;
		this.type = "Empty";
		this.value = 0;
		this.status = 3;
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
	constructor(
		socketid: string //TO DO
	) {
		this.playerhand = [];
		this.id = socketid;
		this.nickname = "Harold"; //If we have too much time we can add this functionality
		this.score = 0;
	}
	printplayershand()//prints players hand in console
	{
		console.log("PLayer " + this.id + " has those tiles in hand:")
		for(var i: number = 0; i < this.playerhand.length; i++)
		{
			console.log(this.playerhand[i])
		}
	}
	 fillplayershand(
		unusedtilestorage: Board["unusedtilestorage"] //used at start of game to give player tiles to play with
	) {
		for (
			var i: number = 0;
			i < 7;
			i++ //draws few tiles to fill players hand
		) {
			const newtile: LetterTile =	unusedtilestorage[Math.floor(Math.random() * unusedtilestorage.length)]; //find random tile from unusedtilestorage
			unusedtilestorage.splice(unusedtilestorage.indexOf(newtile), 1); //remove tile from unusedtilestorage
			newtile.status = 1; //because it lands in players hand
			this.playerhand.push(newtile);
		}
		console.log("Player's hand has been filled");
	}
	 tradetiles(
		chosentile: LetterTile, unusedtilestorage: Board["unusedtilestorage"] //TO DO removes tile chosen by player from his hand and gives him random one from unusedtilestorage
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
