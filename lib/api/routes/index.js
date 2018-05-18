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
//Product
router.get('/product', shopController.getProducts);
router.get('/product/:id/category', shopController.getCategoryByProductId);
router.post('/product', shopController.createSingleResource);
router.patch('/product', shopController.updateSingleResource);
router.delete('/product/:id', shopController.deleteSingleResource);
//Category
router.get('/category/:id/product', shopController.getProductsByCategoryId);
router.post('/category', shopController.createSingleResource);
router.patch('/category', shopController.updateSingleResource);
router.delete('/category/:id', shopController.deleteSingleResource);



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