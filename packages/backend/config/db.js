const fs = require('fs');
const path = require('path');
// open provided file as the database
const db = require('better-sqlite3')(process.env.DB_FILE, {
	verbose: console.log /* function that runs on each query */,
});
db.pragma('journal_mode = WAL'); // apparently recommended and nearly crucial for server performance

/*
	Initiate database from schema
	The schema should be idempotent, meaning that running it multiple times
	has the same result as just running it once; no errors, duplicated tables, or broken db
	this is mostly due to IF NOT EXISTS which skips the CREATE statement if table with the name already exists
*/
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema);

// general function for quering the database
function query(sql, params = []) {
	try {
		return db.prepare(sql).all(params);
	} catch (err) {
		console.error(
			`[FATAL QUERY] ${err.message}\n>>>QUERY: ${sql}\n>>>PARAMS: ${params}`
		);
	}
}

module.exports = {
	db,
	query,
};
