'use strict';

var ShopError = require('./ShopError');

function MissingDataError(detail) {

    ShopError.call(this);

    if (Error.captureStackTrace) {
        Error.captureStackTrace(this);
    } else {
        this.stack = new Error().stack;
    }
    this.message = detail || 'Missing data error';
    this.name = 'MissingDataError';
    this.statusCode = 404;
    this.title = 'Missing data';
}

/*!
 * Inherits from Error.
 */
MissingDataError.prototype = Object.create(ShopError.prototype);
MissingDataError.prototype.constructor = MissingDataError;


module.exports = exports = MissingDataError;
