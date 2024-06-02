const expressWs = require('express-ws');

class Socket {
	constructor() {
		// websocket instance
		this.ws = null;
		// websocket server / handler
		this.wss = null;
		// collection of actions and callback methods
		this.callbacks = {};
	}

	createWs(app) {
		this.ws = expressWs(app);
		this.wss = this.ws.getWss();
		return this.ws;
	}

	getWs() {
		return this.ws;
	}

	getWss() {
		return this.wss;
	}

	use(action, callback) {
		/*
		method for adding pairs of actions and callbacks
		this.handleSocketAction uses the pairs for assigning tasks
		*/
		try {
			if (typeof action !== 'string')
				throw TypeError('Action should be a string');
			if (typeof callback !== 'function')
				throw TypeError('Callback should be a function');

			// if action/callback already exists
			if (this.callbacks.hasOwnProperty(action))
				throw `callback for action ${action} already exists`;

			// if all validations passed, add action and callback to the list
			this.callbacks[action] = callback;
		} catch (error) {
			console.error(error.name + ': ' + error.message);
		}
	}

	listenForMessages = (ws, _req) => {
		/*
		listener for socket messages; uses handleSocketAction to delegate tasks
		NOTE: ws and this.ws are not the same; ws in the socket connection while this.ws is the socket application
		*/
		ws.on('message', (data) => {
			try {
				const message = JSON.parse(data);
				// pass the message obj and the client connection to the handler
				this.handleSocketAction(message, ws);
			} catch (error) {
				console.error('ERROR PARSING SOCKET MESSAGE: ' + error);
			}
		});
	};

	handleSocketAction = (action, ws) => {
		/*
		delegate task to service method depending on action type
		*/
		if (!action?.type) return;
		if (!this.callbacks.hasOwnProperty(action.type))
			return console.warn('Action without callback: ' + action.type);

		// execute callback associated with the type
		// pass action type and payload alongside with `this` refering to the socket,
		// and ws which is the client that initiated the action
		this.callbacks[action.type](action.type, action.payload, this, ws);
	};
}
// define the instance to be used wherever required
const socket = new Socket();
module.exports = socket;
