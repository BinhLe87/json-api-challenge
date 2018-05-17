var mongoose = require('mongoose');



exports.connect = function(url, callback) {

    callback = callback || function(err) {

        if (err) {
            debug('database connection failure: \n' + err.stack);
        }
    };

    url = url || 'mongodb://localhost:27017/shopback';

    mongoose.connect(url, {safe: true}, callback);

    //init configurations
    mongoose.set('debug', true);
}


exports.Product = require('../../models/product');
exports.Category = require('../../models/category');