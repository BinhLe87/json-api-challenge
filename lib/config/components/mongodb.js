var mongoose = require('mongoose');
var joi = require('joi');
var logger = require('winston');
var env = require('./env');

var envVarsSchema = joi.object({

    MONGODB_URL: joi.string().required()
}).unknown().required();


const { error, value: envVars } = joi.validate(process.env, envVarsSchema);

if (error) {
    throw new Error(`Config validation error in mongodb.js: ${error.message}`);
}

(function connect(callback) {

    callback = callback || function(err) {

        if (err) {
            debug('database connection failure: \n' + err.stack);
            logger.error(`database connection failure: \n + ${err.stack}`);

            throw err;
        }
    };

    url = envVars.MONGODB_URL;

    mongoose.connect(url, callback);

    //init configurations
    if (env.isDevelopment || env.isTest) {
        mongoose.set('debug', true);
    }
})();

