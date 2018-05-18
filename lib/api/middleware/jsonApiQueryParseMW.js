'use strict';

var JsonQueryParserClass = require('../utils/jsonApiQueryParser');
var JsonQueryParser = new JsonQueryParserClass();
var debug = require('debug')('jsonApiQueryParseMW');


exports = module.exports = function(req, res, next) {

    var extractedQueryFields = JsonQueryParser.parseRequest(req.originalUrl);

    req.queryFields = extractedQueryFields;
    next();
};

