const nano = require('nano');
const url =
    'https://d_couchdb:Welcome%232@192.168.57.185:5984';
//username:password@endpoint
const nanoDb = nano(url); // connect with couchdb
const pandemic = nanoDb.use('qrpass'); // connect to database

module.exports = { nano, pandemic };