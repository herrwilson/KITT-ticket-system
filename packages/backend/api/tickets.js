const express = require('express');
const router = express.Router();

const tickets = require('../services/ticketService');
const devices = require('../services/deviceService');

// GET /api/tickets
// GET /api/tickets?dateStart=String&dateEnd=String
router.get('/', async (req, res) => {
	try {
		const { dateStart, dateEnd } = req.query;

		let data;
		if (dateStart && dateEnd) {
			data = await tickets.getTicketsByDateRange(dateStart, dateEnd);
		} else {
			data = await tickets.getTickets();
		}
		const meta = { total: data.length };
		res.status(200).json({ data, meta });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// GET /api/search/?q=String
router.get('/search', async (req, res) => {
	try {
		const keyword = req.query.q;
		if (!keyword)
			return res
				.status(404)
				.json({ message: 'missing keyword query: /search?q=text' });

		const data = await tickets.searchTicketsByKeyword(keyword);
		const meta = { total: data.length };
		res.status(200).json({ data, meta });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.message });
	}
});

// GET /api/tickets/:id
router.get('/:id', async (req, res) => {
	const id = req.params.id;
	try {
		// validate id
		if (isNaN(parseInt(id)))
			throw TypeError(
				'Invalid id: was of type ' + typeof id + '; must be number'
			);

		const ticketData = tickets.getTicketById(id);
		const ticketDevices = devices.getDevicesForTicketById(id);

		res.status(200).json({
			data: {
				...ticketData,
				devices: ticketDevices,
			},
			meta: {
				deviceCount: ticketDevices.length,
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// GET /api/tickets/:id/devices
router.get('/:id/devices', async (req, res) => {
	try {
		const { id } = req.params;
		// Call getDevicesForTicket function from ticketService with ticket ID
		const devices = await tickets.getDevicesForTicket(id);
		// Send JSON response with devices
		res.status(200).json({ ticket_id: id, devices });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// GET /api/tickets/:id/comments
router.get('/:id/comments', async (req, res) => {
	try {
		const { id } = req.params;
		// Call getCommentsForTicket function from ticketService with ticket ID
		const comments = await tickets.getCommentsForTicket(id);
		// Send JSON response with comments
		res.status(200).json({ ticket_id: id, comments });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
