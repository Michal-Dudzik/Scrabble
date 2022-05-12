const { io } = require("socket.io-client");
const socket = io.connect('http://localhost:5500');

let selfId


socket.on('connect', () => {selfId = socket.id})
