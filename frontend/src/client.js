// const { list } = require("wordnet");

var localboard;
//var locked;
//room username validation
(function () {
	"use strict";

	// Fetch all the forms we want to apply custom Bootstrap validation styles to
	var forms = document.querySelectorAll(".needs-validation");

	// Loop over them and prevent submission
	Array.prototype.slice.call(forms).forEach(function (form) {
		form.addEventListener(
			"submit",
			function (event) {
				if (!form.checkValidity()) {
					event.preventDefault();
					event.stopPropagation();
				}

				form.classList.add("was-validated");
			},
			false
		);
	});
})();

// Initial screen modal //
var initialScreen = new bootstrap.Modal(
	document.getElementById("initialScreen"),
	{}
);
initialScreen.toggle();

//on click show list of open rooms and hide it when clicked again
document.getElementById("roombtn").addEventListener("click", () => {
	if (document.getElementById("roomList").classList.contains("showRooms")) {
		document.getElementById("roomList").classList.remove("showRooms");
	} else {
		document.getElementById("roomList").classList.add("showRooms");
	}
	getRoomName();
});

//when clicked on a room in the list of rooms, add this name to roomname field
function getRoomName() {
	var room = document.getElementsByClassName("room");

	for (let i = 0; i < room.length; i++) {
		room[i].addEventListener("click", () => {
			document.getElementById("roomName").value = room[i].textContent;
		});
	}
}

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

		socket.emit("acceptedWord", otherplayer);
	});
};

const onDecline = (socket) => (e) => {
	e.preventDefault();

	var declineWord = document.getElementById("declineWord");
	declineWord.addEventListener("click", () => {
		var thisplayer;
		var otherplayer;
		if (localboard.player1.id == socket.id) {
			thisplayer = localboard.player1.id;
			otherplayer = localboard.player2.id;
		} else if (localboard.player2.id == socket.id) {
			thisplayer = localboard.player2.id;
			otherplayer = localboard.player1.id;
		}
		confirmationModal.toggle();
		console.log("declined");
		socket.emit("declinedWord", otherplayer);
	});
};

// Waiting modal //
var waitingModal = new bootstrap.Modal(
	document.getElementById("waitingModal"),
	{}
);
//generating all of the necessary html for tiles
function generateTile(i) {
	const tileBlock = document.createElement("div");
	tileBlock.id = "movedTile_" + i;
	tileBlock.className = "tile toBeMoved";
	tileBlock.setAttribute("letterInside", "");
	tileBlock.setAttribute("draggable", true);

	const letterInBlock = document.createElement("span");
	letterInBlock.id = "letter_" + i;
	letterInBlock.className = "letter";

	const letterScoreInBlock = document.createElement("span");
	letterScoreInBlock.id = "letter_score_" + i;
	letterScoreInBlock.className = "letter_weight";

	document
		.getElementById("tile_" + i)
		.insertAdjacentElement("afterbegin", tileBlock)
		.insertAdjacentElement("afterbegin", letterInBlock)
		.insertAdjacentElement("afterend", letterScoreInBlock);
}

var movedTile = 0;

// Dragging tiles //
function drag() {
	const tile = document.querySelectorAll(".toBeMoved");
	const dropzone = document.querySelectorAll(".dropzone");

	let draggedItem

	for (let i = 0; i < tile.length; i++) {
		const item = tile[i];

		item.addEventListener("dragstart", function () {
			draggedItem = item;
			movedTile = item.parentNode.id.slice(-1);
		});

		item.addEventListener("dragend", function () {
			//get id of dropzone
			const dropzoneId = item.parentNode.id;
			console.log("dropzoneId: " + dropzoneId);
			//get id of letter inside tile
			const tileId = item.getAttribute("letterInside");
			console.log("tileId: " + tileId);

			//checking if place for tile is empty before generating another one
			if (document.getElementById("tile_" + movedTile).children.length == 0)
					generateTile(movedTile);
			
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
}

//drag redone - testing
	const tile = document.querySelectorAll(".toBeMoved");
	const dropzone = document.querySelectorAll(".dropzone");

	let dragItem = null;

	tile.forEach(item => {
		item.addEventListener('dragstart', dragStart)
    	item.addEventListener('dragend', dragEnd)
	});

	dropzone.forEach(list => {
		list.addEventListener('dragover', dragOver);
		list.addEventListener('dragenter', dragEnter);
		list.addEventListener('dragleave', dragLeave);
		list.addEventListener('drop', dragDrop);
	});

	function dragStart() {
		dragItem = this;
		movedTile = dragItem.parentNode.id.slice(-1);
    	setTimeout(() => this.className = 'invisible', 0)
	}
	function dragOver(e) {
		e.preventDefault()
	}
	function dragEnter() {
	}
	function dragLeave() {
	}
	function dragEnd() {
		//get id of dropzone
		const dropzoneId = dragItem.parentNode.id;
		console.log("dropzoneId: " + dropzoneId);
		//get id of letter inside tile
		const tileId = dragItem.getAttribute("letterInside");
		console.log("tileId: " + tileId);

		//checking if place for tile is empty before generating another one
		if (document.getElementById("tile_" + movedTile).children.length == 0)
				generateTile(movedTile);
				
  		this.className = 'tile'
  		dragItem = null;
	}
	function dragDrop() {
		if (this.textContent.trim() === "") this.append(dragItem);
	}


// drag2();
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
				document.getElementById(i + "-" + j).innerHTML = "";
			} else {
				const tileBlock = document.createElement("div");
				tileBlock.className = "tile";

				const letterInBlock = document.createElement("span");
				letterInBlock.className = "letter";
				letterInBlock.innerHTML = localgameboard[i][j].type;

				const letterScoreInBlock = document.createElement("span");
				letterScoreInBlock.className = "letter_weight";
				letterScoreInBlock.innerHTML = localgameboard[i][j].value;

				if (document.getElementById(i + "-" + j).children.length == 0) {
					document
						.getElementById(i + "-" + j)
						.insertAdjacentElement("afterbegin", tileBlock)
						.insertAdjacentElement("afterbegin", letterInBlock)
						.insertAdjacentElement("afterend", letterScoreInBlock);
				}
			}
		}
	}
}
//update player's hand
function updatehand(playerhand) {
	for (var i = 0; i < playerhand.length; i++) {
		document.getElementById("letter_" + i).innerHTML = playerhand[i].type;

		document.getElementById("letter_score_" + i).innerHTML =
			playerhand[i].value;

		document
			.getElementById("movedTile_" + i)
			.setAttribute("letterInside", playerhand[i].id);
	}

	
}
// create list of game rooms "servers" that player can join
function updateroomlist(roomlist) {
	for (var i = 0; i < roomlist.length; i++) {
		var room = document.createElement("li");
		room.innerHTML = roomlist[i];
		room.id = "room_" + i;
		room.className = "room";

		document.getElementById("roomsGoHere").appendChild(room);
		getRoomName();
	}
}
//show words used by the players
function updatewordlist(wordlist, number) {
	document.getElementById("Player" + number + "Words").textContent = "";
	var list = document.createElement("ul");
	for (var i = 0; i < wordlist.length; i++) {
		let item = document.createElement("li");
		item.innerHTML = wordlist[i];
		list.appendChild(item);
	}
	document.getElementById("Player" + number + "Words").appendChild(list);
}
//read data from client and save it in localboard.gameboard
function readfromhtml(socket) {
	for (var i = 0; i < 15; i++) {
		for (var j = 0; j < 15; j++) {
			if (document.getElementById(i + "-" + j).innerHTML !== "") {
				if (
					socket.id == localboard.player1.id &&
					localboard.gameboard[i][j].status != 3
				) {
					let newtile = localboard.player1.playerhand.find(
						(x) =>
							x.id ==
							document
								.getElementById(i + "-" + j)
								.childNodes[0].getAttribute("letterinside")
					);
					localboard.player1.playerhand.splice(
						localboard.player1.playerhand.indexOf(newtile),
						1
					);
					newtile.status = 2;
					localboard.gameboard[i][j] = newtile;
					document.getElementById(i + "-" + j).replaceChildren();
				} else if (
					socket.id == localboard.player2.id &&
					localboard.gameboard[i][j].status != 3
				) {
					let newtile = localboard.player2.playerhand.find(
						(x) =>
							x.id ==
							document
								.getElementById(i + "-" + j)
								.childNodes[0].getAttribute("letterinside")
					);
					localboard.player2.playerhand.splice(
						localboard.player2.playerhand.indexOf(newtile),
						1
					);
					newtile.status = 2;
					localboard.gameboard[i][j] = newtile;
					document.getElementById(i + "-" + j).replaceChildren();
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
	// user.value = "";

	const room = document.querySelector("#roomName");
	const roomName = room.value;
	// room.value = "";

	//checking if input fields are empty
	if (user.value.length == 0 && room.value.length == 0) {
		user.classList.add("is-invalid");
		room.classList.add("is-invalid");
	}
	if (user.value.length == 0 && room.value.length > 0) {
		user.classList.add("is-invalid");
		room.classList.remove("is-invalid");
		room.classList.add("is-valid");
	} else if (user.value.length > 0 && room.value.length == 0) {
		user.classList.remove("is-invalid");
		user.classList.add("is-valid");
		room.classList.add("is-invalid");
	} else if (user.value.length > 0 && room.value.length > 0) {
		socket.emit("joinroom", username, roomName);
		initialScreen.toggle();
	}
};
//when creating new room turn off initial modal, change displayed usernames and room name, emit this data to server
const onCreateGame = (socket) => (e) => {
	e.preventDefault();

	const user = document.querySelector("#username");
	const username = user.value;
	// user.value = "";

	const room = document.querySelector("#roomName");
	const roomName = room.value;
	// room.value = "";

	//checking if input fields are empty
	if (user.value.length == 0 && room.value.length == 0) {
		user.classList.add("is-invalid");
		room.classList.add("is-invalid");
	}
	if (user.value.length == 0 && room.value.length > 0) {
		user.classList.add("is-invalid");
		room.classList.remove("is-invalid");
		room.classList.add("is-valid");
	} else if (user.value.length > 0 && room.value.length == 0) {
		user.classList.remove("is-invalid");
		user.classList.add("is-valid");
		room.classList.add("is-invalid");
	} else if (user.value.length > 0 && room.value.length > 0) {
		socket.emit("newroom", username, roomName);
		initialScreen.toggle();
	}
};
//for test use, ps will stay here
const onEmitbtn = (socket) => (e) => {
	//if(locked = false){
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
<<<<<<< HEAD
	//}
	//else{
		//show popup "its not your turn"
	//}
=======

	// drag2();
>>>>>>> db9b54be2efb2aa66614a45af076fcf41a0ce2c3
};
const onSkipbtn = (socket) => (e) => {
	//if(locked == false){
	e.preventDefault();
	readfromhtml(socket);
	socket.emit("skipturn");
	//}else{
		//show popup "its not your turn"
	//}
}

(() => {
	const newGameButton = document.getElementById("newGame");
	const joinGameButton = document.getElementById("joinGame");
	const roomName = document.getElementById("roomName");
	const Player1 = document.getElementById("Player1");
	const Player2 = document.getElementById("Player2");
	const shufflebtn = document.getElementById("shuffle");
	const skipbtn = document.getElementById("skipbtn");
	const exit = document.getElementById("exit");
	const emitbtn = document.getElementById("emitbtn");
	const refreshbtn = document.getElementById("refreshRooms");

	//connect to server
	const socket = io();

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
		document.querySelector("#Player1Score").innerHTML = board.player1.score;
		document.querySelector("#Player2Score").innerHTML = board.player2.score;
		updatewordlist(board.player1.wordlist, 1);
		updatewordlist(board.player2.wordlist, 2);
		curentRoom.innerHTML = board.id;
		updateboard(localboard.gameboard);
		if (board.player1.id == socket.id) {
			updatehand(board.player1.playerhand);
		} else if (board.player2.id == socket.id) {
			updatehand(board.player2.playerhand);
		}
		// if(board.round % 2 == 0)
		// {
		// 	if(board.player1.id == socket.id)
		// 	{
		// 		locked = false;
		// 	}
		// 	else
		// 	{
		// 		locked = true;
		// 	}
		// }
		// else
		// {
		// 	if(board.player1.id == socket.id)
		// 	{
		// 		locked = true;
		// 	}
		// 	else
		// 	{
		// 		locked = false;
		// 	}
		// }
	});
	socket.on("check", () => {
		//TODO pokaż jakie słówko potwierdzasz
		confirmationModal.toggle();
	});
	socket.on("waiting", () => {
		waitingModal.toggle();
	});
	socket.on("stopWaiting", () => {
		console.log("halp")
		waitingModal.toggle();
	});
	socket.on("startgame", () => {
		socket.emit("start");
		//TODO wyemituj wiadomość że turę zaczyna dany gracz i podaj jego nick
	});

	joinGameButton.addEventListener("click", onJoinGame(socket));

	newGameButton.addEventListener("click", onCreateGame(socket));

	emitbtn.addEventListener("click", onEmitbtn(socket));
	skipbtn.addEventListener("click", onSkipbtn(socket))

	refreshbtn.addEventListener("click", () => {
		const existingRooms = document.getElementById("roomsGoHere");
		existingRooms.innerHTML = "";
		socket.emit("refreshRooms");
	});

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
