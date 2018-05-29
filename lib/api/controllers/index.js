'use strict';
var models = require('../../db/models');
var debug = require('debug')('controllers/index.js');
var myError = require('../../errors/');
var utils = require('../utils');
var jsonApiUtils = require('../utils/jsonApiUtis');
var logger = require('../../config').logger;


exports = module.exports = {};

function getDefaultReturnObject(resourceObjectType) {

    var isValidType = ['single', 'collection'].includes(resourceObjectType);

    if (!isValidType) return {};

    switch (resourceObjectType) {

        case 'single':

            return {
                id: null,
                type: null,
                attributes: null,
                relationships: null,
                meta: null,
                errors: null
            }

        case 'collection':

            return {
                type: null,
                data: [],
                meta: [],
                errors: null
            }
    }
}

exports.getProducts = function (req, res, next) {

    var page = req.query.page && req.query.page.number || 1;
    var limit = req.query.page && req.query.page.size || 10;
    var skip = page * limit - limit;

    var returnObject = {};

    Object.assign(returnObject, getDefaultReturnObject('collection'));

    var data = [];
    var meta = {};
    var primary_type = 'product';
    var queryResult = {};

    var getProductsPromise = models.Product
        .find()
        .skip(skip).sort('_id').limit(limit).populate('category').exec().then(function (results) {

            for (let product of results) {

                data.push({

                    type: 'product',
                    id: product._id,
                    attributes: {
                        name: product.name,
                        price: product.price,
                        description: product.description,
                        tags: product.tags
                    },
                    relationships: {
                        category: {
                            data: {
                                type: 'category',
                                id: product.category ? product.category._id : null
                            }
                        }
                    },
                });

                queryResult.data = data;
            };
        });

    var getTotalCountPromise = models.Product.find().count().exec().then(function (count) {

        meta.total_count = count;
        meta.page_no = page;
        meta.page_size = limit;
        meta.total_page = Math.ceil(count / limit);

        queryResult.meta = meta;
    });

    Promise.all([getProductsPromise, getTotalCountPromise]).then(function () {

        returnObject.type = primary_type;
        Object.assign(returnObject, queryResult);

        res.locals.respObject = returnObject;
        next();
    }).catch(function(err) {
        
        next(err);
    });
}


exports.getCategoryByProductId = function (req, res, next) {

    var product_id = req.params.id;

    var returnObject = {};
    var data = null;

    var getProductsPromise = models.Product
        .findById(product_id)
        .populate('category').exec().then(function (product) {

            if (!product) {

                return Promise.reject(new myError.NotFoundDataError(`Not found the product with id is ${product_id}`));
            }

            var found_category = product.category;

            if (!found_category) return null;

            data = {
                type: 'category',
                id: found_category._id,
                attributes: {
                    name: found_category.name,
                    description: found_category.description,
                    parent: found_category.parent,
                    image: found_category.image,
                    count: found_category.count
                }
            };

            return data;
        }).then(function (data) {

            returnObject.data = data;
            res.locals.respObject = returnObject;
            next();
        }).catch(function (err) {

            next(err);
        });
}

exports.getCategoryById = function (req, res, next) {

    var category_id = req.params.id;

    logger.info('invoking getCategoryById with category_id = ' + category_id);

    var page = req.query.page && req.query.page.number || 1;
    var limit = req.query.page && req.query.page.size || 10;
    var skip = page * limit - limit;

    var returnObject = {};
    var data = [];
    var meta = {};


    Object.assign(returnObject, getDefaultReturnObject('category'));

    var getProductsPromise = models.Category
        .findById(category_id)
        .exec().then(function (found_category) {

            if (!found_category) {

                return Promise.reject(new myError.NotFoundDataError(`Not found the category with id is ${category_id}`));
            }

            data = {
                type: 'category',
                id: category_id,
                attributes: {
                    name: found_category.name,
                    description: found_category.description,
                    parent: found_category.parent,
                    image: found_category.image,
                    count: found_category.count
                }
            };
            
            res.locals.respObject = data;
            next();
        }).catch(function(err) {

            next(err);
        });
}

exports.getProductsByCategoryId = function (req, res, next) {

    var category_id = req.params.id;

    var page = req.query.page && req.query.page.number || 1;
    var limit = req.query.page && req.query.page.size || 10;
    var skip = page * limit - limit;

    var returnObject = {};
    var data = [];
    var meta = {};


    Object.assign(returnObject, getDefaultReturnObject('product'));

    var getProductsPromise = models.Category
        .findById(category_id)
        .populate({
            path: 'products',
            options: {
                sort: '_id',
                skip: skip,
                limit: limit
            }
        }).exec().then(function (category) {

            if (!category) {

                return Promise.reject(new myError.NotFoundDataError(`Not found the category with id is ${category_id}`));
            }

            if (!category.products || category.products.length == 0) return null;

            for (let product of category.products) {

                data.push({

                    type: 'product',
                    id: product._id,
                    attributes: {
                        name: product.name,
                        price: product.price,
                        description: product.description,
                        tags: product.tags
                    }
                });
            };

            return data;
        })

    var getTotalCountPromise = models.Category
        .findById(category_id)
        .populate({
            path: 'products'
        }).exec().then(function (category) {

            if (category && category.products) {

                let total_count = category.products.length;
                meta.total_count = total_count;
                meta.page_no = page;
                meta.page_size = limit;
                meta.total_page = Math.ceil(total_count / limit);
            }
        });

    Promise.all([getProductsPromise, getTotalCountPromise]).then(function () {

        returnObject.data = data;
        returnObject.meta = meta;
        returnObject.errors = [];

        //return res.send(JSON.stringify(returnObject));
        res.locals.respObject = returnObject;
        next();
    }).catch(function (err) {

        next(err);
    })
}


exports.createSingleResource = function createSingleResource(req, res, next) {

    var singleResource = req.body;

    jsonApiUtils.createDocumentForResource(singleResource).then(function(resp) {

        res.status(201).send(JSON.stringify(resp));
    }).catch(function(err) {

        res.status(err.statusCode || 500).send(err.message);
    });
}

exports.updateSingleResource = function updateSingleResource(req, res, next) {

    var singleResource = req.body;
    var origin_singleResource = JSON.parse(JSON.stringify(singleResource));

    jsonApiUtils.updateDocumentForResource(singleResource).then(function (resp) {

        res.status(200).send(JSON.stringify(origin_singleResource));
    }).catch(function (err) {

        res.status(err.statusCode || 500).send(err.message);
    });
}


exports.deleteSingleResource = function deleteSingleResource(req, res, next) {

    var id = req.params.id;
    //Ex: path /product/555 will be splitted into array ["", "product", "555"]
    var primary_resource = req.path.split('/')[1];

    jsonApiUtils.deleteDocumentForResource(primary_resource, req.params.id).then(function (doc) {

        if(!doc) {

            var error = new myError.NotFoundDataError(`Not found resource '${primary_resource}' has 'id' is ${req.params.id}`)

            return res.status(error.statusCode || 500).send(error.message);
        }

        return res.status(204).send('Deletion request is successful');
    }).catch(function (err) {

        res.status(err.statusCode || 500).send(err.message);
    });
}





