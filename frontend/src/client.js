var localboard;
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

//open confirmation modal //
var confirmationModal = new bootstrap.Modal(
	document.getElementById("confirmationModal"),
	{}
);
var playbtn = document.getElementById("play");
playbtn.addEventListener("click", () => {
	confirmationModal.toggle();
});

//open waiting modal //

// Dragging tiles //
const tile = document.querySelectorAll(".tile");
const dropzone = document.querySelectorAll(".dropzone");

let draggedItem = null;

for (let i = 0; i < tile.length; i++) {
	const item = tile[i];

	item.addEventListener("dragstart", function () {
		draggedItem = item;
		setTimeout(function () {
			item.style.display = "none";
		}, 0);
	});

	item.addEventListener("dragend", function () {
		//get id of dropzone
		const dropzoneId = item.parentNode.id;
		console.log("dropzoneId: " + dropzoneId);
		//get id of letter inside tile
		const tileId = item.getAttribute("LetterInside");
		console.log("tileId: " + tileId);

		setTimeout(function () {
			draggedItem.style.display = "flex";
			draggedItem = null;
		}, 0);
	});

	for (let j = 0; j < dropzone.length; j++) {
		const list = dropzone[j];

		list.addEventListener("dragover", function (e) {
			e.preventDefault();
		});

		list.addEventListener("dragenter", function (e) {
			e.preventDefault();
			this.dropzone;
		});

		list.addEventListener("drop", function (e) {
			if (list.textContent.trim() === "") this.append(draggedItem);
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

//updating local gameboard
function updateboard(localgameboard) {
	for (var i = 0; i < 15; i++) {
		for (var j = 0; j < 15; j++) {
			if (localgameboard[i][j].type == "Empty") {
				document.getElementById(i + "-" + j).innerHTML = " ";
			} else {
				document.getElementById(i + "-" + j).innerHTML =
					localgameboard[i][j].type;
			}
		}
	}
}
function updatehand(playerhand) {
	for (var i = 0; i < playerhand.length; i++) {
		document.getElementById("letter_" + i).innerHTML = playerhand[i].type;

		document.getElementById("letter_score_" + i).innerHTML =
			playerhand[i].value;

		document
			.getElementById("tile_" + i)
			.setAttribute("LetterInside", playerhand[i].id);
	}
}
function updateroomlist(roomlist) {
	for (var i = 0; i < roomlist.length; i++) {
		document.getElementById("nazwa").innerHTML = roomlist[i].id;
	}
}
function readfromhtml()
{
	for (var i = 0; i < 15; i++) {
		for (var j = 0; j < 15; j++) {
			
			if (document.getElementById(i + "-" + j).innerHTML !== " ") {
				var thistile;
				
				if(socket.id == localboard.player1.id)
				{
					localgameboard[i][j] = localboard.player1.playerhand.find(elemment => element.id = document.getElementById(i + "-" + j).id)
				}
				if(socket.id == localboard.player2.id)
				{
					
				}
				localgameboard[i][j].type = thistile;
				
			} 
		}
	}
}
//synchronize the gameboard with the server
function PrintBoard(localgameboard) {
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
	var thisplayer;
	var otherplayer;
	if (localboard.player1.id == socket.id) {
		thisplayer = localboard.player1.id;
		otherplayer = localboard.player2.id;
	} else if (localboard.player2.id == socket.id) {
		thisplayer = localboard.player2.id;
		otherplayer = localboard.player1.id;
	}
	socket.emit("checkboard", localboard.gameboard, thisplayer, otherplayer);
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
		localboard = board;
		document.querySelector("#Player1").innerHTML = board.player1.nickname;
		document.querySelector("#Player2").innerHTML = board.player2.nickname;
		curentRoom.innerHTML = board.id;
		updateboard(localboard.gameboard);
		console.log(board.player1.id);
		console.log(board.player2.id);
		console.log(socket.id);
		if (board.player1.id == socket.id) {
			updatehand(board.player1.playerhand);
		} else if (board.player2.id == socket.id) {
			updatehand(board.player2.playerhand);
		}
	});
	socket.on("check", () => {
		//wyświetl graczowi popup że ma sprawdzić board i wyświetl mu gdzieś guzik który potwierdzi że wszystko git git
	});
	socket.on("waiting", () => {
		//show modal
	});
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
