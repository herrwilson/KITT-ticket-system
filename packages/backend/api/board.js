const express = require('express');
const router = express.Router();

const tickets = require('../services/ticketService.js');

// GET /api/board
router.get('/', async (req, res) => {
	try {
		// get ticket data and sort by index
		const data = tickets.getActiveTickets();
		// create empty lists for each status
		const columns = {
			todo: [],
			inProgress: [],
			waitingCustomer: [],
		};
		// loop through all tickets and sort them into column lists based on status
		for (const ticket of data) {
			// delete unnecessary attribute; index is already implied by the normal list index
			// and removing the unnecessary value simplifies client side logic
			delete ticket.indexInCol;
			columns[ticket.status].push(ticket);
		}

		const meta = {
			total: {
				all: data.length,
				todo: columns.todo.length,
				inProgress: columns.inProgress.length,
				waitingCustomer: columns.waitingCustomer.length,
			},
		};
		res.status(200).json({ data: columns, meta });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
