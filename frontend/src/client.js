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

// Draging tiles //
function dragstart_handler(ev) {
	// Set the drag's format and data. Use the event target's id for the data
	ev.dataTransfer.setData("text/plain", ev.target.id);
}

function dragover_handler(ev) {
	ev.preventDefault();
}

function drop_handler(ev) {
	ev.preventDefault();
	// Get the data, which is the id of the drop target
	const data = ev.dataTransfer.getData("text");
	ev.target.appendChild(document.getElementById(data));
	// Clear the drag data cache (for all formats/types)
	ev.dataTransfer.clearData();
	// send current board to server
	socket.emit("board", gameboard);
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

const fillTiles = (socket) => (tiles) => {
	//fill tiles

	letter = "a";
	letter_weight = 1;

	for (let i = 1; i <= 7; i++) {
		const tile = document.querySelector(`#tile_${i}`);

		// const letter = document.createElement("span");
		// letter.classList.add("letter");
		// letter.innerHTML = letter;

		// tile.appendChild(letter);

		// const letter_weight = document.createElement("span");
		// letter_weight.classList.add("letter_weight");
		// letter_weight.innerHTML = letter_weight;

		// tile.appendChild(letter_weight);
	}
};

function updateboard(gameboard) {
	for (var i = 0; i < 16; i++) {
		for (j = 0; j < 16; j++) {
			if (gameboard[i][j] == EmptyTile) {
				document.getElementById(i + "-" + j).innerText = " ";
			} else {
				document.getElementById(i + "-" + j).innerText = gameboard[i][j].type;
			}
		}
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
};

(() => {
	const newGameButton = document.getElementById("newGame"); //get new game button
	const joinGameButton = document.getElementById("joinGame"); //get join game button
	const roomName = document.getElementById("roomName"); //get room input
	const username = document.getElementById("username"); //get player name input
	const acceptWord = document.getElementById("acceptWord"); //get accept word button
	const skip = document.getElementById("skip"); //get skip button
	const exit = document.getElementById("exit"); //get exit button

	const socket = io(); //connect to server

	socket.on("joinroom");

	socket.on("message", log);

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
	// socket.on("yourturn");
	// {
	// 	//unlock drag and drop
	// }

	// socket.on("wyślij słowo do sprawdzenia");
	// {
	// 	//zrób coś
	// 	//zablokuj drag and drop
	// }

	joinGameButton.addEventListener("click", onJoinGame(socket));

	newGameButton.addEventListener("click", onCreateGame(socket));

	exit.addEventListener("click", () => {
		socket.emit("exit", username.value, roomName.value);
		socket.disconnect();
	});

	document //add event listeners for chat
		.querySelector("#chat-form")
		.addEventListener("submit", onChatSubmitted(socket));
})();
