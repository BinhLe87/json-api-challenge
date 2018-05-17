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


router.use(express_query_int());
router.use(apiQueryParser);


//Shop API
router.get('/product', shopController.getProducts);
router.get('/product/:id/category', shopController.getCategoryByProductId);
router.get('/category/:id/product', shopController.getProductsByCategoryId);


//handle error
function errorHandler(err, req, res, next) {

    var env = process.env.NODE_ENV || 'development';

    switch (env) {

        case 'development':

            res.send(JSON.stringify(err));
            break;
        case 'production':

            res.status(500).send('Internal error. Please try again later');
            break;
    }
};


router.use(errorHandler);


exports = module.exports = router;