'use strict';

//Firstly, load configuration from .env file
const path = require('path');
var env_file = require('dotenv').config({ path: path.join(root_path, '/.env')});

if (env_file.error) {

    throw new Error('Error loading .env file: ' + env_file.error.message);
}

const env = require('./components/env');
const logger = require('./components/winston');


const processType = process.env.PROCESS_TYPE;

try {

    var config = require(`./${processType}`);

    config = Object.assign({}, config, env, logger);
} catch (ex) {

    if(ex.code === 'MODULE_NOT_FOUND') {

        logger.error(`No config for process type: ${processType}`);
        throw new Error(`No config for process type: ${processType}`);
    }

    throw ex;
}

module.exports = config;