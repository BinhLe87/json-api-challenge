'use strict';

var mongooseUtils = require('../utils/mongooseUtils');
var logger = require('../../config').logger;
var debug = require('debug')('appendLinksInResponse.js');
var _ = require('lodash');

exports = module.exports = function (base_url_links) {


    return function appendLinksInResponse(req, res, next) {

        var respObject = _.get(res, 'locals.respObject');
        base_url_links = base_url_links || req.originalUrl;

        if (respObject && (/GET/i).test(req.method) && base_url_links) {

            var primary_source = req.originalUrl.split('/')[1];
            mongooseUtils.extractRefsFromSchema(primary_source)
                .then(function (refs) {
                    var links = {};
                    links.self = req.originalUrl;

                    if (refs.length == 1) links.related = {};
                    else if (refs.length > 1) links.related = [];

                    for (let ref of refs) {

                        _.forOwn(ref, function (value, key) {

                            var releatedObj = {};
                            releatedObj.href = `${base_url_links}/${key}`;
                            releatedObj.rel = value;

                            if (Array.isArray(links.related)) links.related.push(releatedObj);
                            else links.related = releatedObj;
                        });
                    }

                    respObject.links = links;

                    next();
                }).catch(function (err) {

                    logger.error(`${err.statusCode || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
                    next();
                });
        } else {

            next();
        }
    }
}