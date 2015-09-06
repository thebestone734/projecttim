// Constants
var LINE_SEGMENT = 0;
var CHAT_MESSAGE = 1;
var GAME_LOGIC = 2;
// Constants for game logic
var WAITING_TO_START = 0;
var GAME_START = 1;
var GAME_OVER = 2;
var GAME_RESTART = 3;

var playerTurn = 0;
var wordsList = ["apple", "idea", "wisdom", "angry"];
var currentAnswer = undefined;
var currentGameState = WAITING_TO_START;

var gameOverTimeout;

// Server side variables and constants
var SERVER_PORT = 8001;
var clients = [];
var ws = require("nodejs-websocket");

var server = ws.createServer(function(connection) {
	
	var index = clients.push(connection) - 1;
	console.log(new Date() + ' Connection accepted.');
	var message = "Welcome " + index + " joining the room. " +
		"Total connections:" + clients.length;
	
	var data = {};
	data.dataType = CHAT_MESSAGE;
	data.sender = "Server";
	data.message = message;
	
	broadcast(JSON.stringify(data));
	
	var gameLogicData = {};
	gameLogicData.dataType = GAME_LOGIC;
	gameLogicData.gameState = WAITING_TO_START;
	
	broadcast(JSON.stringify(gameLogicData));
	
	if(currentGameState == WAITING_TO_START && clients.length >= 2) {
		startGame();
	}
	
	// Event listeners	
	connection.on('text', function (str) {
		var data = JSON.parse(str);
		if(data.dataType == CHAT_MESSAGE) {
			data.sender = index;
		}
        broadcast(JSON.stringify(data));
		
		if(data.dataType == CHAT_MESSAGE) {
			if(currentGameState == GAME_START && data.message == currentAnswer 
					&& playerTurn != clients.indexOf(this)) {
				var gameLogicData = {};
				gameLogicData.dataType = GAME_LOGIC;
				gameLogicData.gameState = GAME_OVER;
				gameLogicData.winner = index;
				gameLogicData.answer = currentAnswer;
				broadcast(JSON.stringify(gameLogicData));
				
				currentGameState = WAITING_TO_START;
				
				clearTimeout(gameOverTimeout);
			}
		}
		
		if(data.dataType == GAME_LOGIC && data.gameState == GAME_RESTART) {
			startGame();
		}
		
    });
	
	connection.on("close", function (code, reason) {
        console.log("Connection closed");
		clients.splice(index, 1);
    });
	
	connection.on("error", function (err) {
		return console.error(err);
		//console.error(err.stack);
		//console.log("Node NOT Exiting properly...");
	}); 
	
}).listen(SERVER_PORT);

function startGame() {
	
	playerTurn = (playerTurn + 1) % clients.length;
	
	var answerIndex = Math.floor(Math.random() * wordsList.length);
	currentAnswer = wordsList[answerIndex];
	
	// Game starts for all the players
	var gameLogicData1 = {};
	gameLogicData1.dataType = GAME_LOGIC;
	gameLogicData1.gameState = GAME_START;
	gameLogicData1.isPlayerTurn = false;
	
	broadcast(JSON.stringify(gameLogicData1));
	
	var i = 0;
	clients.forEach(function(connection) {
		if(i == playerTurn) {
			var gameLogicData2 = {};
			gameLogicData2.dataType = GAME_LOGIC;
			gameLogicData2.gameState = GAME_START;
			gameLogicData2.answer = currentAnswer;
			gameLogicData2.isPlayerTurn = true;
			connection.sendText(JSON.stringify(gameLogicData2));
		}
		i++;
	});
	
	// Game is over after one minute
	gameOverTimeout = setTimeout(function() {
		var gameLogicData = {};
		gameLogicData.dataType = GAME_LOGIC;
		gameLogicData.gameState = GAME_OVER;
		gameLogicData.winner = "No one";
		gameLogicData.answer = currentAnswer;
		broadcast(JSON.stringify(gameLogicData));
		
		currentGameState = WAITING_TO_START;
	}, 60 * 1000);
	
	currentGameState = GAME_START;
}

function broadcast(msg) {
	clients.forEach(function(client) {
		client.sendText(msg);
	});
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
