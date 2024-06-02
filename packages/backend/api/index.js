// import express and call its Router method
const router = require('express').Router();

// define routes
router.use('/api/tickets/', require('./tickets.js'));
router.use('/api/board/', require('./board.js'));
router.use('/api/archive/', require('./archive.js'));
module.exports = router;
