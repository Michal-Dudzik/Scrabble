function handleNewGame() {
	let roomName = makeId(5);
	clientRooms[client.id] = roomName;
	client.emit("joinGame", roomName);

	state[roomName] = createGameState();
}
