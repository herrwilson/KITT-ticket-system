const express = require('express');
const router = express.Router();
const tickets = require('../services/ticketService');

router.get('/', async (req, res) => {
	try {
		const page = req.query.page;
		const size = req.query.size;
		const search = req.query?.search;
		// start a.k.a offset for querying tickets
		const start = (page - 1) * size;
		const data = tickets.getTickets(start, size, search);
		// total amount of tickets in the database
		const totalTickets = tickets.getTicketCount(search);
		// pagination requires total page count
		const totalPages = Math.ceil(totalTickets / size);
		// Send a JSON response
		const meta = {
			total: data.length,
		};
		res.status(200).json({ last_page: totalPages, data, meta });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
