/*
Collection of methods used as callback for websocket actions defined in the root index.
They are called depending on incoming websocket messages and used to keep clients in sync
*/

const tickets = require('./ticketService');
const devices = require('./deviceService');

// importing the ticket schema has to be done like this because of CommonJS and ESM bullshit
// tl;dr, the schemas use ECMAScript / ESM (import .. from ..) which the frontend also use
// backend uses CommonJS (const x = require('...')). CommonJS cannot require() ESM - instead the dynamic import() has to be used
// however, import() is asynchronous, and because top-level awaits still don't exist in CommonJS, the importing has to be done like so
let TicketSchema;
import('@KITT-TS/common').then((mod) => (TicketSchema = mod.TicketSchema));

const ticketDrag = (type, payload, socket, sender) => {
	const wss = socket.getWss();
	const { id, source, destination } = payload;
	// persist change to database
	tickets.updateTicketPosition(id, source, destination);
	// redirect the redux action to all connected clients
	wss.clients.forEach((client) => {
		if (client === sender) return; // skip the original initiator
		client.send(
			JSON.stringify({
				type: 'dispatch',
				action: {
					type: type,
					payload: payload,
				},
			})
		);
	});
};

const ticketCreate = (type, payload, socket, _sender) => {
	try {
		// validate the ticket and possible device data
		const result = TicketSchema.parse(payload);
		const ticket = tickets.createTicket(payload);
		// save each device as a new row, and add them back to the ticket
		for (const deviceData of result.devices) {
			const device = devices.createDevice(ticket.id, deviceData);
			ticket.devices.push(device);
		}

		// send the ticket's data to all clients, including the original sender
		// this is because the initiator does not have the id and some other values
		const wss = socket.getWss();
		wss.clients.forEach((client) => {
			client.send(
				JSON.stringify({
					type: 'dispatch',
					action: {
						type: type,
						payload: ticket,
					},
				})
			);
		});
	} catch (err) {
		console.error(err);
	}
};

const ticketEdit = (type, payload, socket, _sender) => {
	// editing ticket does not affect devices; that is done separately
	try {
		const { id, data } = payload;
		const result = TicketSchema.parse(data);

		// update ticket's basic data
		const updatedTicket = tickets.editTicket(id, result);

		// get new and previous device ids, if any, to compare whether devices have been removed or added
		const newDeviceIds = result.devices.map((dev) => dev?.id || null);
		const prevDeviceIds = devices
			.getDevicesForTicketById(id)
			.map((device) => device.id);
		// find ids that no longer exist
		const removedIds = prevDeviceIds.filter((id) => !newDeviceIds.includes(id));
		for (const id of removedIds) {
			devices.deleteDevice(id);
		}
		// create or edit devices
		for (const device of result.devices) {
			// skip removed devices
			if (removedIds.includes(device.id)) continue;

			const isNew = !device.id || device.id === null;
			if (isNew) {
				const newDevice = devices.createDevice(updatedTicket.id, device);
				updatedTicket.devices.push(newDevice);
			} else {
				const updatedDevice = devices.editDevice(device);
				updatedTicket.devices.push(updatedDevice);
			}
		}

		const wss = socket.getWss();
		wss.clients.forEach((client) => {
			client.send(
				JSON.stringify({
					type: 'dispatch',
					action: {
						type: type,
						payload: updatedTicket,
					},
				})
			);
		});
	} catch (err) {
		console.error(err);
	}
};

module.exports = {
	ticketDrag,
	ticketCreate,
	ticketEdit,
};
