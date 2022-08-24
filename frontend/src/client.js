var localgameboard;

//show initial screen modal //
var initialScreen = new bootstrap.Modal(
	document.getElementById("initialScreen"),
	{}
);
initialScreen.toggle();

// open help modal //
var helpModal = new bootstrap.Modal(document.getElementById("helpModal"), {});
var helpbtn = document.getElementById("help");
helpbtn.addEventListener("click", () => {
	helpModal.toggle();
});

// Dragging tiles //
const list_items = document.querySelectorAll(".tile");
const lists = document.querySelectorAll(".dropzone");

let draggedItem = null;

for (let i = 0; i < list_items.length; i++) {
	const item = list_items[i];

	item.addEventListener("dragstart", function () {
		draggedItem = item;
		setTimeout(function () {
			item.style.display = "none";
		}, 0);
	});

	item.addEventListener("dragend", function () {
		setTimeout(function () {
			draggedItem.style.display = "flex";
			draggedItem = null;
		}, 0);
	});

	for (let j = 0; j < lists.length; j++) {
		const list = lists[j];

		list.addEventListener("dragover", function (e) {
			e.preventDefault();
		});

		list.addEventListener("dragenter", function (e) {
			e.preventDefault();
		});

		list.addEventListener("drop", function (e) {
			this.append(draggedItem);
		});
	}
}

// Chat //
const log = (text) => {
	//log to console
	const parent = document.querySelector("#events");
	const el = document.createElement("li");
	el.innerHTML = text;

	parent.appendChild(el);
	parent.scrollTop = parent.scrollHeight;
};

const onChatSubmitted = (socket) => (e) => {
	//send message to server
	e.preventDefault();

	const input = document.querySelector("#chat");
	const text = input.value;
	input.value = "";

	socket.emit("message", text);
};

// const fillTiles = (socket) => (tiles) => {
// 	//fill tiles

// 	letter = "a";
// 	letter_weight = 1;

// 	for (let i = 1; i <= 7; i++) {
// 		const tile = document.querySelector(`#tile_${i}`);

// const letter = document.createElement("span");
// letter.classList.add("letter");
// letter.innerHTML = letter;

// tile.appendChild(letter);

// const letter_weight = document.createElement("span");
// letter_weight.classList.add("letter_weight");
// letter_weight.innerHTML = letter_weight;

// tile.appendChild(letter_weight);
// 	}
// };

//updating local gameboard
function updateboard(localgameboard) {
	for (var i = 0; i < 15; i++) {
		for (var j = 0; j < 15; j++) {
			if (localgameboard[i][j].type == "Empty") {
				document.getElementById(i + 1 + "-" + (j + 1)).innerHTML = " ";
			} else {
				document.getElementById(i + 1 + "-" + (j + 1)).innerHTML =
					localgameboard[i][j].type;
			}
		}
	}
}

function updatehand(playerhand) {
	for (var i = 0; i < playerhand.length; i++) {
		document.getElementById("tile_" + (i + 1)).innerHTML = playerhand[i].type;
	}
}

//synchronize the gameboard with the server
function UpdateBoard(localgameboard) {
	const rows = 15;

	for (var row = 0; row < rows + 1; row++) {
		console.log(
			localgameboard[row][0].type,
			localgameboard[row][1].type,
			localgameboard[row][2].type,
			localgameboard[row][3].type,
			localgameboard[row][4].type,
			localgameboard[row][5].type,
			localgameboard[row][6].type,
			localgameboard[row][7].type,
			localgameboard[row][8].type,
			localgameboard[row][9].type,
			localgameboard[row][10].type,
			localgameboard[row][11].type,
			localgameboard[row][12].type,
			localgameboard[row][13].type,
			localgameboard[row][14].type
		);
	}
}

const onJoinGame = (socket) => (e) => {
	e.preventDefault();

	const user = document.querySelector("#username");
	const username = user.value;
	user.value = "";

	const room = document.querySelector("#roomName");
	const roomName = room.value;
	room.value = "";

	socket.emit("joinroom", username, roomName);

	initialScreen.toggle();
};

const onCreateGame = (socket) => (e) => {
	e.preventDefault();

	const user = document.querySelector("#username");
	const username = user.value;
	user.value = "";

	const room = document.querySelector("#roomName");
	const roomName = room.value;
	room.value = "";

	socket.emit("newroom", username, roomName);

	initialScreen.toggle();
};
const onEmitbtn = (socket) => (e) => {
	e.preventDefault();
	socket.emit("sendboard", localgameboard);
};

//change letters on bench for the one associated with the player
const changeLetters = (socket) => (letters) => {
	for (let i = 0; i < letters.length; i++) {
		const letter = document.querySelector(`#letter_${i}`);
		letter.innerHTML = letters[i];
	}
};

(() => {
	const newGameButton = document.getElementById("newGame"); //get new game button
	const joinGameButton = document.getElementById("joinGame"); //get join game button
	const roomName = document.getElementById("roomName"); //get room input
	const Player1 = document.getElementById("Player1"); //get player name input
	const Player2 = document.getElementById("Player2");
	const acceptWord = document.getElementById("acceptWord"); //get accept word button
	const skip = document.getElementById("skip"); //get skip button
	const exit = document.getElementById("exit"); //get exit button
	const emitbtn = document.getElementById("emitbtn"); //get emit button

	const socket = io(); //connect to server

	socket.on("joinroom");

	socket.on("message", log);

	socket.on("moveresponse", function (board) {
		localgameboard = board.gameboard;
		document.querySelector("#Player1").innerHTML = board.player1.nickname;
		document.querySelector("#Player2").innerHTML = board.player2.nickname;
		curentRoom.innerHTML = board.id;
		updateboard(localgameboard);
		console.log(board.player1.id);
		console.log(board.player2.id);
		console.log(socket.id);
		if (board.player1.id == socket.id) {
			updatehand(board.player1.playerhand);
		} else if (board.player2.id == socket.id) {
			updatehand(board.player2.playerhand);
		}
	});

	//
	socket.on("startgame", () => {
		socket.emit("start");

		//wyemituj wiadomość że turę zaczyna gracz  i podaj jego nick
	}); //after joining the room show player names and letters
	// socket.on("player1", (player1) => {
	//// 	Player1.innerH.gameboardTML = player1;
	// },
	// socket.on("player2", (player2) => {
	// 	Player2.innerHTML = player2;
	// },
	// socket.on("letters", (letters) => {
	// 	changeLetters(socket)(letters);
	// },
	// socket.on("board", (board) => {
	// 	updateboard(board);
	// },
	// socket.on("turn", (turn) => {
	// 	if (turn == 1) {
	// 		acceptWord.disabled = false;
	// 		skip.disabled = false;
	// 	} else {
	// 		acceptWord.disabled = true;
	// 		skip.disabled = true;
	// 	}
	// },
	// socket.on("winner", (winner) => {
	// 	if (winner == 1) {
	// 		alert("Player 1 wins!");
	// 	} else if (winner == 2) {
	// 		alert("Player 2 wins!");
	// 	} else {
	// 		alert("It's a tie!");
	// 	}
	// },
	// socket.on("error", (error) => {
	// 	alert(error);
	// },
	// socket.on("disconnect", () => {
	// 	alert("You have been disconnected from the server");
	// },
	//////////////////////////////////////////////////////////////////////////////
	// socket.on("moveresponse", board); //recieve board from server and update data
	// {
	// 	updateboard(this.board.gameboard); //wpisz w divy litery znajdujące się w danych miejscach w tabeli

	// 	//zaktualizuj scoreboard
	// 	document.getElementById("player1").innerText = this.board.player1.name;
	// 	document.getElementById("player2").innerText = this.board.player2.name;
	// 	document.getElementById("player1score").innerText =
	// 		this.board.player1.score;
	// 	document.getElementById("player2score").innerText =
	// 		this.board.player2.score;
	// 	//zaktualizuj literki w ręce gracza
	// 	document.getElementById("player1hand").innerText =
	// 		this.board.player1.hand.length;
	// 	document.getElementById("player2hand").innerText =
	// 		this.board.player2.hand.length;
	// 	//zaktualizuj wynik
	// 	document.getElementById("player1score").innerText =
	// 		this.board.player1.score;
	// 	document.getElementById("player2score").innerText =
	// 		this.board.player2.score;
	// }
	socket.on("yourturn");
	{
		//unlock drag and drop
	}

	socket.on("wyślij słowo do sprawdzenia");
	{
		//zrób coś
		//zablokuj drag and drop
	}

	joinGameButton.addEventListener("click", onJoinGame(socket));

	newGameButton.addEventListener("click", onCreateGame(socket));

	emitbtn.addEventListener("click", onEmitbtn(socket));

	exit.addEventListener("click", () => {
		socket.emit("exit", username.value, roomName.value);
		socket.disconnect();
	});

	document //add event listeners for chat
		.querySelector("#chat-form")
		.addEventListener("submit", onChatSubmitted(socket));
})();
