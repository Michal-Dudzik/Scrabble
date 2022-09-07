var localboard;

// Initial screen modal //
var initialScreen = new bootstrap.Modal(
	document.getElementById("initialScreen"),
	{}
);
initialScreen.toggle();

//on click show list of open rooms and hide it when clicked again
document.getElementById("roomList").addEventListener("click", () => {
	if (document.getElementById("roomList").classList.contains("showRooms")) {
		document.getElementById("roomList").classList.remove("showRooms");
	} else {
		document.getElementById("roomList").classList.add("showRooms");
	}
});

// Help modal //
var helpModal = new bootstrap.Modal(document.getElementById("helpModal"), {});
var helpbtn = document.getElementById("help");
helpbtn.addEventListener("click", () => {
	helpModal.toggle();
});

// Confirmation modal //
var confirmationModal = new bootstrap.Modal(
	document.getElementById("confirmationModal"),
	{}
);

const onConfirm = (socket) => (e) => {
	e.preventDefault();

	var acceptWord = document.getElementById("acceptWord");
	acceptWord.addEventListener("click", () => {
		confirmationModal.toggle();
		//once implemented add sending word to server for scoring
		console.log("approved");
		var thisplayer;
		var otherplayer;
		if (localboard.player1.id == socket.id) {
			thisplayer = localboard.player1.id;
			otherplayer = localboard.player2.id;
		} else if (localboard.player2.id == socket.id) {
			thisplayer = localboard.player2.id;
			otherplayer = localboard.player1.id;
		}

		socket.emit("acceptedWord", localboard, thisplayer, otherplayer);
	});
};

const onDecline = (socket) => (e) => {
	e.preventDefault();

	var declineWord = document.getElementById("declineWord");
	declineWord.addEventListener("click", () => {
		confirmationModal.toggle();
		console.log("declined");
		socket.emit("declinedWord");
	});
};

// Waiting modal //
var waitingModal = new bootstrap.Modal(
	document.getElementById("waitingModal"),
	{}
);

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

//update player's hand
function updatehand(playerhand) {
	for (var i = 0; i < playerhand.length; i++) {
		const tile = document.createElement("div");
		tile.id = "movedTile_" + i;
		tile.className = "tile";
		tile.setAttribute("LetterInside", "");
		tile.setAttribute("draggable", "true");

		const letter = document.createElement("span");
		letter.id = "letter_" + i;
		letter.className = "letter";

		const letterScore = document.createElement("span");
		letterScore.id = "letter_score_" + i;
		letterScore.className = "letter_weight";

		document.getElementById("tile_" + i).appendChild(tile);
		document.getElementById("movedTile_" + i).appendChild(letter);
		document.getElementById("movedTile_" + i).appendChild(letterScore);

		document.getElementById("letter_" + i).innerHTML = playerhand[i].type;

		document.getElementById("letter_score_" + i).innerHTML =
			playerhand[i].value;

		document
			.getElementById("movedTile_" + i)
			.setAttribute("LetterInside", playerhand[i].id);
	}
}
// create list of game rooms "servers" that player can join
function updateroomlist(roomlist) {
	for (var i = 0; i < roomlist.length; i++) {
		// document.getElementById("roomList").innerHTML = roomlist[i].id;
		console.log(roomlist[i].id);
	}
}
//read data from client and save it in localboard.gameboard
function readfromhtml(socket) {
	for (var i = 0; i < 15; i++) {
		for (var j = 0; j < 15; j++) {
			if (document.getElementById(i + "-" + j).innerHTML !== " ") {
				if (
					socket.id == localboard.player1.id &&
					localboard.gameboard[i][j].status != 3
				) {
					let newtile = localboard.player1.playerhand.find(
						(x) =>
							x.id ==
							document
								.getElementById(i + "-" + j)
								.childNodes[1].getAttribute("letterinside")
					);
					localboard.player1.playerhand.splice(
						localboard.player1.playerhand.indexOf(newtile),
						1
					);
					newtile.status = 2;
					localboard.gameboard[i][j] = newtile;
				} else if (
					socket.id == localboard.player2.id &&
					localboard.gameboard[i][j].status != 3
				) {
					let newtile = localboard.player2.playerhand.find(
						(x) =>
							x.id ==
							document
								.getElementById(i + "-" + j)
								.childNodes[1].getAttribute("letterinside")
					);
					localboard.player2.playerhand.splice(
						localboard.player2.playerhand.indexOf(newtile),
						1
					);
					newtile.status = 2;
					localboard.gameboard[i][j] = newtile;
				}
			}
		}
	}
}
//print letter for the player
function PrintHand(hand) {
	for (var i = 0; i < hand.length; i++) {
		console.log(hand[i]);
	}
}
//print board
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
//preatty much the same as onCreateGame
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
//when creating new room turn off initial modal, change displayed usernames and room name, emit this data to server
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

//for test use, ps will stay here
const onEmitbtn = (socket) => (e) => {
	e.preventDefault();
	readfromhtml(socket);
	var thisplayer;
	var otherplayer;
	var hand1 = localboard.player1.playerhand;
	var hand2 = localboard.player2.playerhand;
	if (localboard.player1.id == socket.id) {
		thisplayer = localboard.player1.id;
		otherplayer = localboard.player2.id;
	} else if (localboard.player2.id == socket.id) {
		thisplayer = localboard.player2.id;
		otherplayer = localboard.player1.id;
	}
	socket.emit(
		"checkboard",
		localboard.gameboard,
		hand1,
		hand2,
		thisplayer,
		otherplayer
	);
};

(() => {
	const newGameButton = document.getElementById("newGame");
	const joinGameButton = document.getElementById("joinGame");
	const roomName = document.getElementById("roomName");
	const Player1 = document.getElementById("Player1");
	const Player2 = document.getElementById("Player2");
	const shufflebtn = document.getElementById("shuffle");
	const skip = document.getElementById("skip");
	const exit = document.getElementById("exit");
	const emitbtn = document.getElementById("emitbtn");

	//connect to server
	const socket = io();

	//nie działa tak jak byśmy chcieli, trzeba przerobić jak się łączy z serwerem
	socket.on("roomlist", function (boardnames) {
		updateroomlist(boardnames);
	});

	socket.on("joinroom");

	socket.on("message", log);

	socket.on("moveresponse", function (board) {
		localboard = board;
		console.log("hand1");
		PrintHand(localboard.player1.playerhand);
		console.log("hand2");
		PrintHand(localboard.player2.playerhand);
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
		confirmationModal.toggle();
	});
	socket.on("waiting", () => {
		waitingModal.toggle();
	});
	socket.on("stopWaiting", () => {
		waitingModal.toggle();
	});
	socket.on("startgame", () => {
		socket.emit("start");

		//TODO wyemituj wiadomość że turę zaczyna dany gracz i podaj jego nick
	});

	joinGameButton.addEventListener("click", onJoinGame(socket));

	newGameButton.addEventListener("click", onCreateGame(socket));

	emitbtn.addEventListener("click", onEmitbtn(socket));

	acceptWord.addEventListener("click", onConfirm(socket));

	declineWord.addEventListener("click", onDecline(socket));

	// shufflebtn.addEventListener("click", updatehand(socket));

	//disconnecting from server
	exit.addEventListener("click", () => {
		socket.emit("exit", username.value, roomName.value);
		socket.disconnect();
	});

	document //add event listeners for chat
		.querySelector("#chat-form")
		.addEventListener("submit", onChatSubmitted(socket));
})();
