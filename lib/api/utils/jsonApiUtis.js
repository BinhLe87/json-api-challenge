'use strict';
var _ = require('lodash');
var mongoose = require('mongoose');
var mongoose_conn = mongoose.connection;
var debug = require('debug')('api/utils/jsonApiUtils.js');
var myError = require('../../errors/');

exports = module.exports = {};

exports.parseType = function parseType(singleResouceObj) {

    var body_data = singleResouceObj.data || singleResouceObj;

    return body_data.type || {};
}

exports.parseId = function parseId(singleResouceObj) {

    var body_data = singleResouceObj.data || singleResouceObj;

    return body_data.id || {};
}
/**
 * Parse `attributes` tag and return as the object container
 * 
 * @param {any} singleResouceObj 
 * @returns {Object} object container has format
 *          `{<attribute_name_1> : <attribute_value_1>, ...}`
 */
exports.parseAttributes = function parseAttributes(singleResouceObj) {

    var attributeObj = {};
    var body_data = singleResouceObj.data || singleResouceObj;

    _.forOwn(body_data, (value, key) => {

        if ((/attributes/i).test(key)) {

            attributeObj = value;
        }
    });

    return attributeObj;
}
/**
 * 
 * 
 * @param {any} resourceObj 
 * @returns {Object} Object expressing the relationships of primary resource along with `id` value. It has format
 *          `{<relationship_name_1> : <id:{String|Array}>, ...`
 */
exports.parseRelationships = function parseRelationships(singleResource) {

    function parseRelationShipsInDeep(key, value, relationships) {

        if (key == 'relationships') {

            relationships.push(value);
        } else {

            if (_.isObject(value)) {

                _.forOwn(value, (prop_value, prop_key) => {

                    parseRelationShipsInDeep(prop_key, prop_value, relationships);
                });
            }
        }

        return relationships;
    }

    function flattenRelationships(relationships) {

        return _.reduce(relationships, function (result, value, key) {
            if (_.isObject(value)) {

                _.forOwn(value, function (value, key) {

                    let relationship_name = key;
                    let relationship_values = value.data || value;

                    if (Array.isArray(relationship_values)) {

                        result[relationship_name] = [];
                        for (let data_item of relationship_values) {

                            result[relationship_name].push(data_item.id);
                        }
                    } else { //single Object

                        return result[relationship_name] = relationship_values.id;
                    }
                });
            }

            return result;
        }, {});
    }

    var relationships = []
    _.forOwn(singleResource, (value, key) => {

        parseRelationShipsInDeep(key, value, relationships);
    });

    return flattenRelationships(relationships);
}

exports.buildUpdateMongoQuery = function buildUpdateMongoQuery(singleResource) {

    return new Promise(function (resolve, reject) {

        var relationshipsObj = exports.parseRelationships(singleResource);
        var attributesObj = exports.parseAttributes(singleResource);
        var type = exports.parseType(singleResource);
        var id = exports.parseId(singleResource);

        var targetModel;
        try {

            targetModel = mongoose_conn.model(type);
        } catch (ex) {

            reject(ex);
        }

        var conditions = _.isEmpty(id) ? {} : { "_id": id };
        var updateOpts = { $set: attributesObj };
        //compile relationships into Mongoose update query
        var compiledRelationships = {};
        _.forOwn(relationshipsObj, function (relationship_values, relationship_name) {

            if (Array.isArray(relationship_values)) { //push update for array

                compiledRelationships['$push'] = {};
                compiledRelationships['$push'][relationship_name] = { $each: relationship_values };

            } else { //single update

                compiledRelationships['$set'] = {};
                compiledRelationships['$set'][relationship_name] = relationship_values;
            }
        });

        _.merge(updateOpts, compiledRelationships);
        debug(updateOpts);

        var query = mongoose_conn.model(type).update(conditions, updateOpts, {
            upsert: true
        }).exec(function(err, result) {

            if(err) reject(err);

            resolve(result);
        });

        //resolve(query);
    });
}

exports.createDocumentForResource = function createDocumentForResource(singleResource) {

    return new Promise(function (resolve, reject) {

        var relationshipsObj = exports.parseRelationships(singleResource);
        var attributesObj = exports.parseAttributes(singleResource);
        var type = exports.parseType(singleResource);

        var targetModel;

        //check whether the model exists
        try {

            targetModel = mongoose_conn.model(type);
        } catch (ex) {

            reject(new myError.NotFoundDataError(`the resource ${type} does not exists.`));
        }

        //check whether the relationship(s) exists
        var schema = mongoose_conn.model(type).schema;
        _.forOwn(relationshipsObj, function (relationship_value, relationship_name) {        

            if (!schema.path(relationship_name)) {

                reject(new myError.ShopError(`The relationship ${relationship_name} does not exists`));
            }
        });

        var createOpts = attributesObj;

        mongoose_conn.model(type).create(createOpts, function (err, doc) {

            if (err) return reject(err);

            //update relationships of this resource
            if (doc.length > 1) {

                return reject(new myError.ShopError('Unable to create relationship(s) for multiple resources at one time'));
            }

            _.forOwn(relationshipsObj, function (relationship_values, relationship_name) {            
                
                if(Array.isArray(relationship_values)) {

                    if (!(schema.path(relationship_name) instanceof mongoose.Schema.Types.Array)) {

                        return reject(new myError.NotFoundDataError(`The relationship '${relationship_name}' is not supported one-to-many relationship`));
                    }
                
                    let pushQuery = {};
                    pushQuery['$push'] = {};
                    pushQuery['$push'][relationship_name] = { $each: relationship_values };
                    
                    doc.update(pushQuery).exec(function (err, result) {

                        if(err) {

                            debug(err);
                            return reject(new myError.ShopError(`Error creating the relationship '${ relationship_name }'`));
                        }
                    });
                } else {

                    doc[relationship_name] = relationship_values;
                }
            });

            //build the response object contains the primary resource created
            var resp = {};
            resp.data = {
                type: type,
                id: doc._id,
                attributes: attributesObj
            }
            resolve(resp);
        });
    });
}

exports.jsonApiQueryParser = require('./jsonApiQueryParser');
exports.jsonApiMongoParser = require('./jsonApiMongoParser');