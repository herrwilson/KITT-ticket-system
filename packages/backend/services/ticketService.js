const { db, query } = require('../config/db.js');

const getColumnTicketCount = (status) => {
	// return the amount of tickets with given status
	const data = query(
		'SELECT count(*) AS "count" FROM ticket WHERE status = ?',
		[status]
	);
	return data[0].count;
};

const _getWhereStatementForSearch = (searchQuery) => {
	// generate a WHERE clause for filtering by query
	if (!searchQuery) return '';
	return `
	WHERE
		LOWER(title || email || phone || additional_information)
		GLOB LOWER('*${searchQuery}*')`;
};

const getTicketCount = (keyword = null) => {
	// return the total amount of tickets. Optionally search by keyword.
	const where = _getWhereStatementForSearch(keyword);
	const data = query('SELECT count(*) AS "count" FROM ticket' + where);
	return data[0].count;
};

const getTicketById = (id) => {
	const data = db.prepare('SELECT * FROM ticket WHERE id = ?').get(id);
	return data;
};

const getTickets = (offset, rowCount, keyword = null) => {
	// return tickets of given page. Optionally search by keyword.
	// more info on the LIMIT and OFFSET
	// https://www.sqlitetutorial.net/sqlite-limit/
	try {
		let data;
		if (keyword) {
			// to achieve case insensitivity we make everything lower case
			// thus, select all from tickets where title, email, phone, or additional_information
			// in lower case matches *keyword* in lowercase
			// and then limit the results by row count and offset
			const where = _getWhereStatementForSearch(keyword);
			data = query(
				`SELECT * FROM ticket
				${where}
				LIMIT ?,?`,
				[offset, rowCount]
			);
		} else {
			data = query('SELECT * FROM ticket LIMIT ?,?', [offset, rowCount]);
		}
		return data;
	} catch (e) {
		console.error('Error fetching tickets:', e);
		return [];
	}
};

const getActiveTickets = () => {
	try {
		const tickets = query(
			'SELECT * from ticket WHERE status != ? ORDER BY indexInCol',
			['archive']
		).map((ticket) => {
			// fetch devices related to the tickets
			// OPTIMIZE: at a later time this can be done, for example, when user
			// hovers on a ticket, rather than from the start
			// this should somewhat reduce the time to load the ticket data, but with low
			// amount of tickets this probably isn't too much of an issue
			const devices = query('SELECT * FROM device WHERE ticketId == ?', [
				ticket.id,
			]);
			ticket.devices = devices;
			return ticket;
		});
		return tickets;
	} catch (err) {
		console.error(err);
		return [];
	}
};

const getTicketsByDateRange = (dateStart, dateEnd) => {
	try {
		const data = query(
			`SELECT * FROM ticket WHERE creation_date BETWEEN ? AND ?`,
			[dateStart, dateEnd]
		);
		console.log(data);
		return data;
	} catch (error) {
		console.error(error);
		return [];
	}
};

const getDevicesForTicket = (ticketId) => {
	try {
		const devices = query('SELECT * FROM Device WHERE ticketId = ?', [
			ticketId,
		]);
		return devices;
	} catch (error) {
		console.error(error);
		return [];
	}
};

const getCommentsForTicket = (ticketId) => {
	try {
		const comments = query('SELECT * FROM Comment WHERE ticketId = ?', [
			ticketId,
		]);
		return comments;
	} catch (error) {
		console.error(error);
		return [];
	}
};

const updateTicketPosition = (id, source, destination) => {
	const isStatusChange = source.droppableId !== destination.droppableId;
	// find ticket that is being moved
	const movedTicket = query('SELECT * FROM ticket WHERE id = ?', [id]);
	// select all tickets from old and new column except the moved ticket
	const getColumnTickets = db.prepare(
		'SELECT * FROM ticket WHERE status = ? AND id != ? ORDER BY indexInCol ASC'
	);
	const originalColumnTickets = getColumnTickets.all([source.droppableId, id]);
	const newColumnTickets = getColumnTickets.all([destination.droppableId, id]);

	// object for storing ticket id's and their indices
	const ticketsForFixing = {};
	// loop through old column and check everything is in correct order
	for (let i = 0; i < originalColumnTickets.length; i++) {
		const { id, indexInCol } = originalColumnTickets[i];
		if (indexInCol === i) continue;
		ticketsForFixing[id] = i;
	}

	// insert moved ticket to the new column and check everything is in correct order
	newColumnTickets.splice(destination.index, 0, movedTicket[0]);
	for (let i = 0; i < newColumnTickets.length; i++) {
		const { id, indexInCol } = newColumnTickets[i];
		if (indexInCol === i) continue;
		ticketsForFixing[id] = i;
	}

	// update all tickets at once in a single transaction
	const updatePosition = db.prepare(
		'UPDATE ticket SET indexInCol = ? WHERE id = ?'
	);
	const updateMany = db.transaction((tickets) => {
		for (const [id, index] of tickets) {
			updatePosition.run([index, id]);
		}
		if (isStatusChange) {
			db.prepare('UPDATE ticket SET status = ? WHERE id = ?').run([
				destination.droppableId,
				id,
			]);
		}
	});
	updateMany(Object.entries(ticketsForFixing));
};

const createTicket = (data) => {
	const create = db.prepare(
		'INSERT INTO ticket (title, status, additional_information, email, phone, indexInCol) VALUES ($title, $status, $additionalInformation, $email, $phone, $indexInCol)'
	);

	// if status is provided, use it; otherwise default to "todo"
	const status = data?.status ?? 'todo';
	// count is used to set the ticket's index in its column
	// new entry's index is always the same as previous length
	const count = getColumnTicketCount(status);
	const ticketData = {
		title: data.title,
		status,
		additionalInformation: data.additional_information,
		email: data.email,
		phone: data.phone,
		indexInCol: count,
	};
	// get the added ticket's data with the id returned
	const { lastInsertRowid } = create.run(ticketData);
	const ticket = getTicketById(lastInsertRowid);
	// initiate an empty list for possible devices
	ticket.devices = [];
	return ticket;
};

const editTicket = (id, data) => {
	const { title, email, phone, additional_information } = data;
	const update = db.prepare(
		'UPDATE ticket SET title = ?, email = ?, phone = ?, additional_information = ? WHERE id = ?'
	);
	update.run(title, email, phone, additional_information, id);
	const ticket = getTicketById(id); // fetch the changes and other information
	ticket.devices = [];
	return ticket;
};

module.exports = {
	getTickets,
	getTicketById,
	getActiveTickets,
	updateTicketPosition,
	createTicket,
	editTicket,
	getTicketCount,
	getTicketsByDateRange,
	getDevicesForTicket,
	getCommentsForTicket,
};
