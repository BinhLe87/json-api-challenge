'use strict';

var JsonQueryParserClass = require('../utils/jsonApiQueryParser');
var JsonQueryParser = new JsonQueryParserClass();
var debug = require('debug')('jsonApiQueryParseMiddleware');


exports = module.exports = function(req, res, next) {

    var extractedQueryFields = JsonQueryParser.parseRequest(req.originalUrl);
    debug(extractedQueryFields);

    req.queryFields = extractedQueryFields;
    next();
};

