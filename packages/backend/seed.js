require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('better-sqlite3')(process.env.DB_FILE);

const mockDataPath = path.join('config/', 'data.sql');
const mockData = fs.readFileSync(mockDataPath, 'utf-8');
db.exec(mockData);
