'use strict';
var _ = require('lodash');
var mongoose = require('mongoose');
var mongoose_conn = mongoose.connection;
var debug = require('debug')('api/utils/jsonApiUtils.js');
var myError = require('../../errors/');
var logger = require('../../config').logger;
var uuidv4 = require('uuid/v4');
var models = require('../../db/models');


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

exports.updateDocumentForResource = function updateDocumentForResource(singleResource) {

    return new Promise(function (resolve, reject) {

        var relationshipsObj = exports.parseRelationships(singleResource);
        var attributesObj = exports.parseAttributes(singleResource);
        var type = exports.parseType(singleResource);
        var id = exports.parseId(singleResource);

        if (!type || !id) {

            return reject(new myError.MissingDataError(`Missing the required fields either 'type' or 'id' field`));
        }

        var targetModel;
        try {

            targetModel = mongoose_conn.model(type);
        } catch (ex) {

            return reject(new myError.NotFoundDataError(`the resource '${type}' does not exists.`));
        }

        var conditions = { "_id": id };
        var updateOpts = { $set: attributesObj };
        //compile relationships into Mongoose update query
        var compiledRelationships = {};
        var schema = mongoose_conn.model(type).schema;
        _.forOwn(relationshipsObj, function (relationship_values, relationship_name) {

            if (Array.isArray(relationship_values)) { //push update for array

                if (!(schema.path(relationship_name) instanceof mongoose.Schema.Types.Array)) {

                    return reject(new myError.NotFoundDataError(`The relationship '${relationship_name}' is not supported one-to-many relationship`));
                }

            }

            compiledRelationships['$set'] = {};
            compiledRelationships['$set'][relationship_name] = relationship_values;
        });

        _.merge(updateOpts, compiledRelationships);
        debug(updateOpts);

        var query = mongoose_conn.model(type).update(conditions, updateOpts, {
            upsert: false
        }).exec(function (err, result) {

            if (err) {
                debug(err);
                return reject(new myError.ShopError(`Error updating the resource ${type}`));
            }

            resolve(result);
        });
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

            reject(new myError.NotFoundDataError(`the resource '${type}' does not exists.`));
        }

        //check whether the relationship(s) exists
        var schema = mongoose_conn.model(type).schema;
        _.forOwn(relationshipsObj, function (relationship_value, relationship_name) {

            if (!schema.path(relationship_name)) {

                reject(new myError.ShopError(`The relationship '${relationship_name}' does not exists`));
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

                if (Array.isArray(relationship_values)) {

                    if (!(schema.path(relationship_name) instanceof mongoose.Schema.Types.Array)) {

                        return reject(new myError.NotFoundDataError(`The relationship '${relationship_name}' is not supported one-to-many relationship`));
                    }

                    let pushQuery = {};
                    pushQuery['$push'] = {};
                    pushQuery['$push'][relationship_name] = { $each: relationship_values };

                    doc.update(pushQuery).exec(function (err, result) {

                        if (err) {

                            debug(err);
                            return reject(new myError.ShopError(`Error creating the relationship '${relationship_name}'`));
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

exports.deleteDocumentForResource = function deleteDocumentForResource(modelName, id) {

    return new Promise(function (resolve, reject) {

        if (!modelName || !id) {

            return reject(new myError.MissingDataError(`Missing either the 'primary resource' or 'id' field need to be deleted`));
        }

        var targetModel;

        //check whether the model exists
        try {

            targetModel = mongoose_conn.model(modelName);
        } catch (ex) {

            reject(new myError.NotFoundDataError(`the resource '${modelName}' does not exists.`));
        }

        mongoose_conn.model(modelName).findByIdAndRemove(id, function (err, doc) {

            if (err) return reject(err);

            resolve(doc);
        });
    });
}

exports.createDocumentForResourceWith2PhaseCommit = function createDocumentForResourceWith2PhaseCommit(singleResource) {

    return new Promise(function (resolve, reject) {

        var relationshipsObj = exports.parseRelationships(singleResource);
        var attributesObj = exports.parseAttributes(singleResource);
        var type = exports.parseType(singleResource);

        var targetModel;

        //check whether the model exists
        try {

            targetModel = mongoose_conn.model(type);
        } catch (ex) {

            return reject(new myError.NotFoundDataError(`the resource '${type}' does not exists.`));
        }

        //check whether the relationship(s) exists
        var schema = mongoose_conn.model(type).schema;
        var relationshipNotExistsError;
        _.forOwn(relationshipsObj, function (relationship_value, relationship_name) {

            if (!schema.path(relationship_name)) {

                relationshipNotExistsError = new myError.ShopError(`The relationship '${relationship_name}' does not exists`);
            }
        });
        if (relationshipNotExistsError instanceof Error) {

            return reject(relationshipNotExistsError);
        }

        //Create a transaction
        var trans_id = uuidv4();
        var transaction = new models.Transaction({

            _id: trans_id,
            lastModified: new Date(),
            data: {
                source: 'product',
                destination: 'category'
            }
        });

        var created_resource_id;
        transaction.save().then(function (created_trans) {

            //update transaction state to 'pending'            
            created_trans.state = 'pending';
            return created_trans.save();

        }).then(function (pending_trans) {

            var createOpts = JSON.parse(JSON.stringify(attributesObj));
            Object.assign(createOpts, { pendingTransactions: [pending_trans._id] });

            var relationshipPromiseArray = []; //array of Promises for creating relationships in parallel

            //Create primary resource
            mongoose_conn.model(type).create(createOpts)
                .then(function (created_resource) {

                    created_resource_id = created_resource._id;

                    if (!created_resource) return Promise.reject(new myError.ShopError(`Failed to create resource ${type}`));

                    //Create all relationships of this primary resource
                    _.forOwn(relationshipsObj, function (relationship_values, relationship_name) {

                        relationshipPromiseArray.push(new Promise(function (resolve, reject) {

                            if (Array.isArray(relationship_values)) {

                                if (!(schema.path(relationship_name) instanceof mongoose.Schema.Types.Array)) {

                                    return reject(new myError.NotFoundDataError(`The relationship '${relationship_name}' is not supported one-to-many relationship`));
                                }

                                let pushQuery = {};
                                pushQuery['$push'] = {};
                                pushQuery['$push'][relationship_name] = { $each: relationship_values };

                                created_resource.update(pushQuery).exec(function (err, result) {

                                    if (err) {

                                        logger.error(err);
                                        return reject(new myError.ShopError(`Error creating the relationship '${relationship_name}'`));
                                    }

                                    if (result) return resolve(result);
                                });
                            } else {

                                created_resource[relationship_name] = relationship_values;
                                return resolve();
                            }
                        }));
                    });

                    //Handle updating the transaction state and/or rollback if any error occurs
                    Promise.all(relationshipPromiseArray).then(function (results) {

                        models.Transaction.findById(trans_id).update({ state: 'applied' }, function (err, result) { });

                        if (created_resource_id) {

                            mongoose_conn.model(type).findById(created_resource_id).update({ $pull: { pendingTransactions: trans_id } }, function (err, result) {

                                if (result) {

                                    models.Transaction.findById(trans_id).update({ state: 'done' }, function (err, result) { });
                                }
                            });

                            //build the response object contains the primary resource created
                            var resp = {};
                            resp.data = {
                                type: type,
                                id: created_resource_id,
                                attributes: attributesObj
                            }
                            return resolve(resp);
                        }
                    }).catch(function (error) {  //Rollback => delete document of this primary resource

                        models.Transaction.findById(trans_id).update({ state: 'canceling' }, function (err, result) { });

                        mongoose_conn.model(type).findByIdAndRemove(created_resource_id, function (err, result) {

                            if (result) {

                                debug(`Done rollback by removing the resource has id '${created_resource_id}'`);
                            }
                        });

                        models.Transaction.findById(trans_id).update({ state: 'cancelled' }, function (err, result) { });

                        return reject(new myError.ShopError(`Failed to create resource ${type}`));
                    });
                }).catch(function (error) {

                    logger.error(`Error creating resource ${type}: ${error.message}`);
                    return reject(error);
                });            
        }).catch(function (error) {

            logger.error(error);
            return reject(error);
        });


    });
}

exports.jsonApiQueryParser = require('./jsonApiQueryParser');
exports.jsonApiMongoParser = require('./jsonApiMongoParser');