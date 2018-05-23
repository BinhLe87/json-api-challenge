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

router.use(morgan('combined', {stream: winston.stream}));
router.use(express_query_int());
router.use(apiQueryParser);
//HACK: just for test
var mongooseUtils = require('../utils/mongooseUtils');

// router.use(function(req, res, next) {

//     mongooseUtils.extractRefsFromSchema('category');
// });



//Shop API
//Product
router.get('/product', shopController.getProducts);
router.get('/product/:id/category', appendLinksInResponse('/product'), shopController.getCategoryByProductId);
router.post('/product', shopController.createSingleResource);
router.patch('/product', shopController.updateSingleResource);
router.delete('/product/:id', shopController.deleteSingleResource);
//Category
router.get('/category/:id/product', appendLinksInResponse('/category'), shopController.getProductsByCategoryId);
router.post('/category', shopController.createSingleResource);
router.patch('/category', shopController.updateSingleResource);
router.delete('/category/:id', shopController.deleteSingleResource);



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