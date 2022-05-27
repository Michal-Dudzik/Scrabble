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
document.addEventListener("DOMContentLoaded", (event) => {
	var dragSrcEl = null;

	function handleDragStart(e) {
		dragSrcEl = this;

		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/html", this.innerHTML);
	}

	function handleDragOver(e) {
		if (e.preventDefault) {
			e.preventDefault();
		}

		e.dataTransfer.dropEffect = "move";

		return false;
	}

	function handleDrop(e) {
		if (e.stopPropagation) {
			e.stopPropagation(); // stops the browser from redirecting.
		}

		if (dragSrcEl != this) {
			dragSrcEl.innerHTML = this.innerHTML;
			this.innerHTML = e.dataTransfer.getData("text/html");
		}

		return false;
	}

	function handleDragEnd(e) {
		this.style.opacity = "1";

		items.forEach(function (item) {
			item.classList.remove("over");
		});
	}

	let items = document.querySelectorAll(".dropzone .draggable");
	items.forEach(function (item) {
		item.addEventListener("dragstart", handleDragStart, false);
		item.addEventListener("dragover", handleDragOver, false);
		item.addEventListener("drop", handleDrop, false);
		item.addEventListener("dragend", handleDragEnd, false);
	});
});

// Dragndrop inny sposób ale nie do końca działa//
// const boxes = document.querySelectorAll('.dropzone');

// boxes.forEach(box => {
//     box.addEventListener('dragenter', dragEnter)
//     box.addEventListener('dragover', dragOver);
//     box.addEventListener('dragleave', dragLeave);
//     box.addEventListener('drop', drop);
// });

// function dragEnter(e) {
//     e.preventDefault();
//     e.target.classList.add('drag-over');
// }

// function dragOver(e) {
//     e.preventDefault();
//     e.target.classList.add('drag-over');
// }

// function dragLeave(e) {
//     e.target.classList.remove('drag-over');
// }

// function drop(e) {
//     e.target.classList.remove('drag-over');

//     // get the draggable element
//     const id = e.dataTransfer.getData('text/plain');
//     const draggable = document.getElementById(id);

//     // add it to the drop target
//     e.target.appendChild(draggable);

//     // display the draggable element
//     draggable.classList.remove('hide');
// }

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
socket.on("startgame", function(socket)
{
	socket.emit("start")
})
socket.on("roundresponse", function(socket)
{/*
	//zrób ruch i wyślij go serwerowi 
 */})
//join game
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

	// joinGameButton.addEventListener("click", () => {
	// 	socket.emit("joinroom", roomName.value, username.value);
	// 	console.log("Room: " + roomName.value);
	// 	console.log("Player: " + username.value);
	// });

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
