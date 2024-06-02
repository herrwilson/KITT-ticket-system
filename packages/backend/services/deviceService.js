const { db } = require('../config/db.js');

const getDeviceById = (id) => {
	const device = db.prepare('SELECT * FROM device WHERE id == ?').get(id);
	return device;
};

const getDevicesForTicketById = (ticketId) => {
	const devices = db
		.prepare('SELECT * FROM device WHERE ticketId = ?')
		.all(ticketId);
	return devices;
};

const createDevice = (ticketId, data) => {
	const create = db.prepare(
		'INSERT INTO device (type, brand, model, password, problemDescription, ticketId) VALUES ($type, $brand, $model, $password, $problemDescription, $ticketId)'
	);
	const deviceData = {
		type: data.type,
		brand: data.brand,
		model: data.model,
		password: data.password,
		problemDescription: data.issue,
		ticketId,
	};
	const { lastInsertRowid } = create.run(deviceData);
	const device = getDeviceById(lastInsertRowid);
	return device;
};

const editDevice = (data) => {
	const { id, type, brand, model, password, issue } = data;
	const update = db.prepare(
		'UPDATE device SET type = ?, brand = ?, model = ?, password = ?, problemDescription = ? WHERE id = ?'
	);
	update.run(type, brand, model, password, issue, id);
	// there's no modified dates or anything for Devices so we can return the data right away
	return data;
};

const deleteDevice = (deviceId) => {
	const result = db.prepare('DELETE FROM device WHERE id = ?').run(deviceId);
	return result;
};

module.exports = {
	createDevice,
	getDeviceById,
	getDevicesForTicketById,
	editDevice,
	deleteDevice,
};
