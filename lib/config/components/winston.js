'use strict';

var winston = require('winston');
const joi = require('joi');
require('winston-papertrail').Papertrail;


var envVarsSchema = joi.object({

    LOGGER_LEVEL: joi.string()
        .allow(['error', 'warn', 'info', 'verbose', 'debug', 'silly'])
        .default('info'),
    LOGGER_ENABLED: joi.boolean()
        .truthy('TRUE')
        .truthy('true')
        .falsy('FALSE')
        .falsy('false')   
        .default(true)
})  .unknown()
    .required();

const { error, value: envVars } = joi.validate(process.env, envVarsSchema);

if (error) {
    throw new Error(`Config validation error in winston.js: ${error.message}`);
}


var winstonPapertrail = new winston.transports.Papertrail({
    host: 'logs5.papertrailapp.com',
    port: 19155,
    level: 'debug',
    hostname: 'shopJsonAPI'
})

var options = {
    file: {
        level: 'error',
        filename: `./logs/app.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    },
    console: {
        handleExceptions: true,
        json: false,
        colorize: true,
        timestamp: true
    },
    winstonPapertrail: winstonPapertrail
};


var logger = new winston.Logger({

    transports: [
        new winston.transports.File(options.file),
        new winston.transports.Console(options.console),
        winstonPapertrail
    ],
    exitOnError: false,
    level: envVars.LOGGER_LEVEL
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
    write: function (message, encoding) {
        // use the 'info' log level so the output will be picked up by both transports (file and console)
        logger.info(message);
    },
};

module.exports.logger = logger;