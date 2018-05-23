'use strict';

var express = require('express');
var router = express.Router();
//controller
var shopController = require('../controllers/');
//database 
var mongodb = require('../../config/db');
mongodb.connect();
//middleware
var express_query_int = require('express-query-int');
var apiQueryParser = require('../middleware/jsonApiQueryParseMW');
var appendLinksInResponse = require('../middleware/appendLinksInResponse');
//logger
var morgan = require('morgan');
var winston = require('../../../config/winston');
//utilities
var _ = require('lodash');

router.use(morgan('combined', {stream: winston.stream}));
router.use(express_query_int());
router.use(apiQueryParser);

//Shop API
//Product
router.get('/product(s)?', shopController.getProducts);
router.get('/product/:id/category', shopController.getCategoryByProductId);
router.post('/product', shopController.createSingleResource);
router.patch('/product', shopController.updateSingleResource);
router.delete('/product/:id', shopController.deleteSingleResource);
//Category
router.get('/category/:id/product(s)?', shopController.getProductsByCategoryId);
router.get('/category/:id', shopController.getCategoryById, appendLinksInResponse());
router.post('/category', shopController.createSingleResource);
router.patch('/category', shopController.updateSingleResource);
router.delete('/category/:id', shopController.deleteSingleResource);

//response to client
router.use(function(req, res, next) {

    var respObject = _.get(res, 'locals.respObject');

    if (respObject) {

        return res.send(JSON.stringify(respObject));
    } else {

        return res.status(404).send(`${req.originalUrl} not found`);
    }
});


//default final error handling
function errorHandler(err, req, res, next) {

    var env = process.env.NODE_ENV || 'development';

    switch (env) {

        case 'development':            

            winston.error(`${err.statusCode || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)

            return res.status(err.status || 500).send(err.message);
        case 'production':

            return res.status(500).send('Internal server error. Please try again later');
    }
};


router.use(errorHandler);


exports = module.exports = router;