'use strict';

//save the root_path of application
global.root_path = __dirname;

var http = require('http');
var path = require('path');
var debug = require('debug')('server');
var shopRouter = require('./lib/api/routes');
var env = require('dotenv').config({ path: './.env' });
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var utils = require('./lib/utils');
//DB Mongo
var db = require('./lib/config/db');
db.connect();

if (env.error) {

    throw new Error('Error loading .env file: ' + env.error.message);
}

var port = process.env.SB_API_PORT || 3001;


//for parsing application/json
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', shopRouter);

app.listen(port);

exports = module.exports = app;








