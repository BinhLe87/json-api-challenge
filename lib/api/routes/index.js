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


router.use(express_query_int());


//Shop API
router.get('/product', shopController.getProducts);
router.get('/product/:id/category', shopController.getCategoryByProductId);
router.get('/category/:id/product', shopController.getProductsByCategoryId);





exports = module.exports = router;