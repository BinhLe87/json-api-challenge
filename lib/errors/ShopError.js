'use strict';

function ShopError(detail) {
    Error.call(this);

    if (Error.captureStackTrace) {
        Error.captureStackTrace(this);
    } else {
        this.stack = new Error().stack;
    }
    this.message = detail || 'Internal error. Please try again';
    this.name = 'ShopError';
    this.statusCode = 500;
    this.title = 'Internal Error';
}

/*!
 * Inherits from Error.
 */
ShopError.prototype = Object.create(Error.prototype);
ShopError.prototype.constructor = ShopError;

module.exports = exports = ShopError;
