require('dotenv').config(); // load environmental variables from .env
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const socket = require('./config/socket');
const socketService = require('./services/socketService');
// initiate app as well as WebSocket class and make it importable elsewhere
const app = express();
// anything else that require('/config/socket') has to be imported only after the creation
// otherwise for those applications socket.ws and socket.wss is null
socket.createWs(app);

// enable cors
app.use(cors());
// parse application/json
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// define api router
// everything under /api/ should be router.use'd in /api/index.js, not here
app.use('/', require('./api/'));
// define what happens when client connects to the websocket
app.ws('/ws', socket.listenForMessages);
// define actions and their respective callbacks
socket.use('kanban/taskDragged', socketService.ticketDrag);
socket.use('kanban/createTicket', socketService.ticketCreate);
socket.use('kanban/editTicket', socketService.ticketEdit);

app.set('port', 8080);
app.listen(app.get('port'), () => {
	console.log(
		`[server]: Server is running at http://localhost:${app.get('port')}`
	);
});
