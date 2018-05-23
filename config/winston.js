'use strict';

var winston = require('winston');
require('winston-papertrail').Papertrail;

var winstonPapertrail = new winston.transports.Papertrail({
    host: 'logs5.papertrailapp.com',
    port: 19155,
    level: 'debug',
    hostname: 'shopJsonAPI'
})

var options = {
    file: {
        level: 'info',
        filename: `./logs/app.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    },
    console: {
        level: 'debug',
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
    exitOnError: false
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
    write: function (message, encoding) {
        // use the 'info' log level so the output will be picked up by both transports (file and console)
        logger.info(message);
    },
};

module.exports = logger;