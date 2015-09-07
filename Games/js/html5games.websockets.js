
var websocketGame = {
	isDrawing : false,
	isTurnToDraw : false,
	startX : 0,
	startY : 0,
	LINE_SEGMENT : 0,
	CHAT_MESSAGE : 1,
	GAME_LOGIC : 2,
	// Constans for game logic state
	WAITING_TO_START : 0,
	GAME_START : 1,
	GAME_OVER : 2,
	GAME_RESTART : 3
};

var canvas = document.getElementById("drawing-pad");
var ctx = canvas.getContext("2d");

// WebSocket control
$(function() {
	if(window["WebSocket"]) {
		
		websocketGame.socket = new WebSocket("ws://127.0.0.1:3000/");
		
		websocketGame.socket.onopen = function(e) {
			console.log("WebSocket connection established.");
		};
		
		websocketGame.socket.onmessage = function(e) {
			console.log("onmessage event:", e.data);
			var data = JSON.parse(e.data);
			if(data.dataType == websocketGame.CHAT_MESSAGE) {
				$("#chat-history").append("<li>" + data.sender + " said: " +
					data.message + "</li>");
				$("#chat-history").scrollTop($("#chat-history")[0].scrollHeight);
			} else if(data.dataType == websocketGame.LINE_SEGMENT) {
				drawLine(ctx, data.startX, data.startY, data.endX, data.endY, 1);
			} else if(data.dataType == websocketGame.GAME_LOGIC) {
				if(data.gameState == websocketGame.GAME_OVER) {
					websocketGame.isTurnToDraw = false;
					$("#chat-history").append("<li>" + data.winner + " wins!" +
						" The answer is '" + data.answer + "'.</li>");
					$("#restart").show();
				}
				if(data.gameState == websocketGame.GAME_START) {
					// Clear the canvas !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
					canvas.width = canvas.width;
					
					// Hide the restart button
					$("#restart").hide();
					
					// Clear the chat history
					$("#chat-history").html("");
					
					if(data.isPlayerTurn) {
						websocketGame.isTurnToDraw = true;
						$("#chat-history").append("<li>Your turn to draw. Please draw '" +
							data.answer + "'.</li>");
					} else {
						$("chat-history").append("<li>Game Started. Get Ready. You have" + 
							" one minute to guess.</li>");
					}
				}
			}
	
		};
		
		websocketGame.socket.onclose = function(e) {
			console.log("WebSocket connection closed.");
		};
	}
});

// Waiting for a click event
$("#send").click(sendMessage);

// Restarting or rather starting another round
$("#restart").click(sendRestart);

// Element waits for ENTER pressed
$("#chat-input").keypress(function(event) {
	if(event.keyCode == '13') {
		sendMessage();
	}
});

// Callback for sending messages to server
function sendMessage() {
	var message = $("#chat-input").val();
	
	var data = {};
	data.dataType = websocketGame.CHAT_MESSAGE;
	data.message = message;
	
	websocketGame.socket.send(JSON.stringify(data));
	$("#chat-input").val("");
}

// Callback for restarting the game
function sendRestart() {
	var data = {};
	data.dataType = websocketGame.GAME_LOGIC;
	data.gameState = websocketGame.GAME_RESTART;
	websocketGame.socket.send(JSON.stringify(data));
}

// The logic for drawing on canvas
$("#drawing-pad").mousedown(function(e) {
	var mouseX = e.offsetX || 0;
	var mouseY = e.offsetY || 0;
	
	websocketGame.startX = mouseX;
	websocketGame.startY = mouseY;
	websocketGame.isDrawing = true;
});

$("#drawing-pad").mousemove(function(e) {
	if(websocketGame.isDrawing) {
		var mouseX = e.offsetX || 0;
		var mouseY = e.offsetY || 0;

		if(!(mouseX == websocketGame.startX && mouseY == websocketGame.startY) && websocketGame.isTurnToDraw) {
			drawLine(ctx, websocketGame.startX, websocketGame.startY, 
				mouseX, mouseY, 1);
			
			var data = {};
			data.dataType = websocketGame.LINE_SEGMENT;
			data.startX = websocketGame.startX;
			data.startY = websocketGame.startY;
			data.endX = mouseX;
			data.endY = mouseY;
			websocketGame.socket.send(JSON.stringify(data));
			
			websocketGame.startX = mouseX;
			websocketGame.startY = mouseY;
		}
	}
});

$("#drawing-pad").mouseup(function(e) {
	websocketGame.isDrawing = false;
});

function drawLine(ctx, x1, y1, x2, y2, thickness) {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.lineWidth = thickness;
	ctx.strokeStyle = "#444";
	ctx.stroke();
}
