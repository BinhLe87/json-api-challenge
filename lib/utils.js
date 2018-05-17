'use strict';

var moment = require('moment');
var debug = require('debug')('sb:utils');
var contract = require('../vendor/contract');
//mongoose
var mongoose = require('mongoose');

exports = module.exports = {};


/**
 * @returns date string with format YYYY-MM-DD HH:mm:ssZZ
 */
exports.getCurrentLocaleTimeWithTimeZone = function() {

    moment.locale('en');
    return moment().format('YYYY-MM-DD HH:mm:ssZZ');
}

