var sendForm = document.querySelector("#chatform"),
	textInput = document.querySelector(".chatbox"),
	chatList = document.querySelector(".chatlist"),
	userBubble = document.querySelectorAll(".userInput"),
	botBubble = document.querySelectorAll(".bot__output"),
	animateBotBubble = document.querySelectorAll(".bot__input--animation"),
	overview = document.querySelector(".chatbot__overview"),
	hasCorrectInput,
	imgLoader = false,
	animationCounter = 1,
	animationBubbleDelay = 600,
	input,
	previousInput,
	isReaction = false,
	chatbotButton = document.querySelector(".submit-button");

sendForm.onkeydown = function (e) {
	if (e.keyCode == 13) {
		e.preventDefault();

		//No mix ups with upper and lowercases
		var input = textInput.value.toLowerCase();

		//Empty textarea fix
		if (input.length > 0) {
			createBubble(input);
		}
	}
};

sendForm.addEventListener("submit", function (e) {
	//so form doesnt submit page (no page refresh)
	e.preventDefault();

	//No mix ups with upper and lowercases
	var input = textInput.value.toLowerCase();

	//Empty textarea fix
	if (input.length > 0) {
		createBubble(input);
	}
}); //end of eventlistener

var createBubble = function (input) {
	//create input bubble
	var chatBubble = document.createElement("li");
	chatBubble.classList.add("userInput");

	//adds input of textarea to chatbubble list item
	chatBubble.innerHTML = input;

	//adds chatBubble to chatlist
	chatList.appendChild(chatBubble);

	checkInput(input);
};

var checkInput = function (input) {
	hasCorrectInput = false;
	isReaction = false;
	//Checks all text values in possibleInput
	for (var textVal in possibleInput) {
		//If user reacts with "yes" and the previous input was in textVal
		// if (input == "yes" || input.indexOf("yes") >= 0) {
		// 	if (previousInput == textVal) {
		// 		console.log("sausigheid");

		// 		isReaction = true;
		// 		hasCorrectInput = true;
		// 		botResponse(textVal);
		// 	}
		// }
		// if (input == "no" && previousInput == textVal) {
		// 	unkwnCommReaction = "For a list of commands type: Commands";
		// 	unknownCommand("I'm sorry to hear that :(");
		// 	unknownCommand(unkwnCommReaction);
		// 	hasCorrectInput = true;
		// }
		//Is a word of the input also in possibleInput object?
		if (
			input == textVal ||
			(input.indexOf(textVal) >= 0 && isReaction == false)
		) {
			console.log("succes");
			hasCorrectInput = true;
			botResponse(textVal);
		}
	}
	// //When input is not in possibleInput
	// if (hasCorrectInput == false) {
	// 	console.log("failed");
	// 	unknownCommand(unkwnCommReaction);
	// 	hasCorrectInput = true;
	// }
};

// debugger;

function botResponse(textVal) {
	//sets previous input to that what was called
	// previousInput = input;

	//create response bubble
	var userBubble = document.createElement("li");
	userBubble.classList.add("bot__output");

	if (isReaction == true) {
		if (typeof reactionInput[textVal] === "function") {
			//adds input of textarea to chatbubble list item
			userBubble.innerHTML = reactionInput[textVal]();
		} else {
			userBubble.innerHTML = reactionInput[textVal];
		}
	}

	if (isReaction == false) {
		//Is the command a function?
		if (typeof possibleInput[textVal] === "function") {
			// console.log(possibleInput[textVal] +" is a function");
			//adds input of textarea to chatbubble list item
			userBubble.innerHTML = possibleInput[textVal]();
		} else {
			userBubble.innerHTML = possibleInput[textVal];
		}
	}
	//add list item to chatlist
	chatList.appendChild(userBubble); //adds chatBubble to chatlist

	// reset text area input
	textInput.value = "";
}

function unknownCommand(unkwnCommReaction) {
	// animationCounter = 1;

	//create response bubble
	var failedResponse = document.createElement("li");

	failedResponse.classList.add("bot__output");
	failedResponse.classList.add("bot__output--failed");

	//Add text to failedResponse
	failedResponse.innerHTML = unkwnCommReaction; //adds input of textarea to chatbubble list item

	//add list item to chatlist
	chatList.appendChild(failedResponse); //adds chatBubble to chatlist

	animateBotOutput();

	// reset text area input
	textInput.value = "";

	//Sets chatlist scroll to bottom
	chatList.scrollTop = chatList.scrollHeight;

	animationCounter = 1;
}

function responseText(e) {
	var response = document.createElement("li");

	response.classList.add("bot__output");

	//Adds whatever is given to responseText() to response bubble
	response.innerHTML = e;

	chatList.appendChild(response);

	animateBotOutput();

	console.log(response.clientHeight);

	//Sets chatlist scroll to bottom
	setTimeout(function () {
		chatList.scrollTop = chatList.scrollHeight;
		console.log(response.clientHeight);
	}, 0);
}

function responseImg(e) {
	var image = new Image();

	image.classList.add("bot__output");
	//Custom class for styling
	image.classList.add("bot__outputImage");
	//Gets the image
	image.src = "../media/" + e;
	chatList.appendChild(image);

	animateBotOutput();
	if (image.completed) {
		chatList.scrollTop = chatList.scrollTop + image.scrollHeight;
	} else {
		image.addEventListener("load", function () {
			chatList.scrollTop = chatList.scrollTop + image.scrollHeight;
		});
	}
}

//change to SCSS loop
function animateBotOutput() {
	chatList.lastElementChild.style.animationDelay =
		animationCounter * animationBubbleDelay + "ms";
	animationCounter++;
	chatList.lastElementChild.style.animationPlayState = "running";
}

function commandReset(e) {
	animationCounter = 1;
	previousInput = Object.keys(possibleInput)[e];
}

var possibleInput = {
	rules: function () {
		responseText("The rules are simple");
		responseText(
			"<b>1#</b> The first player combines two or more of his or her letters to form a word and places it on the board to read either across or down with one letter on the center square. Diagonal words are not allowed. "
		);
		responseText("<b>2#</b> Complete your turn by clicking play ");
		responseText(
			"<b>3#</b> Add one or more letters to those already played to form new words. If, at the same time, they touch others letters in adjacent rows, those must also form complete words, with all such letters. The player gets full credit for all words formed or modified on his or her turn.  "
		);
		responseText(
			"<b>4#</b> No tile may be shifted or replaced after it has been played and scored"
		);
		responseText(
			"<b>5#</b> You may use a turn to exchange all, some, or none of the letters. This ends your turn"
		);
		responseText(
			"<b>6#</b> Any play may be challenged before the next player starts a turn. If the play challenged is unacceptable, the challenged player takes back his or her tiles and loses that turn. If the play challenged is acceptable, the challenger loses his or her next turn.All words made in one play are challenged simultaneously. If any word is unacceptable, then the entire play is unacceptable."
		);
		responseText(
			"<b>7#</b> The game ends when all letters have been drawn and one player uses his or her last letter; or when all possible plays have been made. "
		);
		commandReset(0);
		return;
	},
	about: function () {
		responseText(
			"On this GitHub page you'll find everything about this project"
		);
		responseText(
			"<a href='https://github.com/Michal-Dudzik/Scrabble'>Scrabble</a>"
		);
		commandReset(1);
		return;
	},
	help: function () {
		responseText("This is a list of commands you can try:");
		responseText("Help, Rules, About, Rick Roll");
		commandReset(2);
		return;
	},
	"rick roll": function () {
		responseImg("roll.png");
		setTimeout(function () {
			window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
		}, 2000);
	},
};
