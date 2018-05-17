'use strict';

var ShopError = require('./ShopError');

function NotFoundDataError(detail) {

    ShopError.call(this);

    if (Error.captureStackTrace) {
        Error.captureStackTrace(this);
    } else {
        this.stack = new Error().stack;
    }
    this.message = detail || 'Not found data';
    this.name = 'NotFoundDataError';
    this.statusCode = 404;
    this.title = 'Not found data';
}

/*!
 * Inherits from Error.
 */
NotFoundDataError.prototype = Object.create(ShopError.prototype);
NotFoundDataError.prototype.constructor = NotFoundDataError;


module.exports = exports = NotFoundDataError;
