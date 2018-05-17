'use strict';

var path = require('path');
var contract = require(path.join(root_path, 'vendor', 'contract.js'));


exports = module.exports = {};

exports.handleETag = function handleETag(getCachedEtag) {
    contract(arguments)
        .params('function')
        .end();

    return function (req, res, next) {

        getCachedEtag(req, function (err, etag) {

            if (!etag) {

                return next();
            }

            var sendFunc = res.send;

            res.send = function () {

                var if_none_match = req.headers['if-none-match'];

                if (if_none_match === etag) {

                    res.status(304);
                }

                sendFunc.apply(res, arguments);
            }

            next();
        });
    }
}

exports.buildResponseError = function buildResponseError(error) {

    if (!(error instanceof Error)) return null;

    var respError = {};

    if (error.statusCode) { respError.status = error.statusCode; }
    if (error.title) { respError.title = error.title; }
    if (error.message) { respError.detail = error.message; }
    
    return respError;

}