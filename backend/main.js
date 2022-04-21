//TODO: generowanie planszy Scrable
// no nie działa to, coś się sypie, zastanów się czy wgl warto to generować, czy nie lepiej machnąć ręcznie planszy w htmlu

// class ScrabbleBoard {
// 	/**
// 	 * Initialise scrabble board
// 	 */
// 	constructor() {
// 		this.board = document.getElementById("js-board");
// 	}

// 	/**
// 	 * Layout scrabble board
// 	 */
// 	draw() {
// 		var sb = this;
// 		var boardSize = 14;
// 		var tileScore = {};
// 		var tileScoreIdx = {
// 			ct: [112],
// 			tw: [0, 7, 105],
// 			tl: [20, 76, 80],
// 			dw: [16, 32, 48, 64],
// 			dl: [3, 36, 45, 52, 92, 96, 108],
// 		};

// 		if (sb.board !== null) {
// 			var tabletop = $(sb.board);
// 			var board = $("<div>").addClass("board");
// 			// define a quarter of the board and use for x and y axis mirroring
// 			for (var i = 0; i <= boardSize; i++) {
// 				if (window.CP.shouldStopExecution(0)) break;
// 				var row = $("<div>").addClass("row");
// 				for (var j = 0; j <= boardSize; j++) {
// 					if (window.CP.shouldStopExecution(1)) break;
// 					var tile = $("<div>")
// 						.addClass("tile")
// 						.attr({ "data-row": i, "data-col": j })
// 						.append($("<div>").addClass("decal"))
// 						.append($("<input>").attr({ maxlength: 1, readonly: 1 }));
// 					var ti = this.toTileIndex(i, j);
// 					for (var t in tileScoreIdx) {
// 						var idx = tileScoreIdx[t].indexOf(ti);
// 						if (idx >= 0) {
// 							tile.addClass("tile-" + t);
// 							if (i !== boardSize / 2 || j !== boardSize / 2) {
// 								tile.children(".decal").text(t.toUpperCase());
// 							}
// 							if (j <= boardSize) {
// 								// flip col
// 								var tiHMir = this.toTileIndex(i, boardSize - j);
// 								tileScoreIdx[t].push(tiHMir);
// 							}
// 							if (i <= boardSize) {
// 								// flip row
// 								var tiVMir = this.toTileIndex(boardSize - i, j);
// 								tileScoreIdx[t].push(tiVMir);
// 							}
// 							//tileScoreIdx[t].splice(idx, 1);
// 							break;
// 						}
// 					}
// 					row.append(tile);
// 				}
// 				window.CP.exitedLoop(1);
// 				board.append(row);
// 			}
// 			window.CP.exitedLoop(0);
// 			tabletop.append(board);
// 			// listener for tile keydown event
// 			tabletop.on("keydown", ".tile input", function (event) {
// 				var elem = $(this);
// 				var ltr = event.key;
// 				var keyCode = event.keyCode;
// 				// only update on alphabet char
// 				if (keyCode >= 65 && keyCode <= 90) {
// 					elem.val(ltr);
// 					elem.addClass("filled");
// 					elem.parent(".tile").attr("data-value", sb.letterValue(ltr));
// 				}
// 				// clear on backspace or delete
// 				else if (keyCode == 8 || keyCode == 46) {
// 					elem.removeClass("filled");
// 					elem.parent(".tile").removeAttr("data-value");
// 				}
// 				// allow change
// 				return true;
// 			});
// 		} else {
// 			console.log("board not defined");
// 		}
// 	}

// 	/**
// 	 * Converts row and column to single index.
// 	 * @param {int} row
// 	 * @param {int} column
// 	 * @returns {int} -1 if row or column is out of range
// 	 */
// 	toTileIndex(row, column) {
// 		var boardLen = 15;
// 		if (row < boardLen && row >= 0 && column < boardLen && column >= 0) {
// 			return row * boardLen + column;
// 		} else {
// 			return -1;
// 		}
// 	}

// 	/**
// 	 * Get the letter score value
// 	 */
// 	letterValue(letter) {
// 		var tileScore = {
// 			0: "?",
// 			1: "a,e,i,l,n,o,r,s,t,u",
// 			2: "d,g",
// 			3: "b,c,m,p",
// 			4: "f,h,v,w,y",
// 			5: "k",
// 			8: "j,x",
// 			10: "q,z",
// 		};

// 		if (letter.length === 1) {
// 			for (var v in tileScore) {
// 				if (tileScore[v].indexOf(letter.toLowerCase()) >= 0) {
// 					return v;
// 				}
// 			}
// 		}
// 		return null;
// 	}
// }

// var board = new ScrabbleBoard();
// board.draw();
