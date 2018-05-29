'use strict';

//save the root_path of application
global.root_path = __dirname;
var config = require('./lib/config');

var http = require('http');
var path = require('path');
var debug = require('debug')('server');
var shopRouter = require('./lib/api/routes');

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var utils = require('./lib/utils');



var port = process.env.PORT || 3001;

var myPath = path.join(root_path, 'vendor', 'contract.js')
debug(myPath);



//for parsing application/json
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', shopRouter);

app.listen(port);

exports = module.exports = app;








