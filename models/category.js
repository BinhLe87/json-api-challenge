'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');
var mongoose_auto_increment = require('mongoose-auto-increment')

mongoose_auto_increment.initialize(mongoose.connection);


var CategorySchema = new Schema({

    name: String,   
    description: String,
    parent: {
        type: Number,
        default: null
    },
    image: {
        type: String,
        default: ''
    },
    count: {
        type: Number,
        default: 0
    },
    products: [{
        type: Number,
        ref: 'Product'
    }]
});


CategorySchema.plugin(timestamps);
CategorySchema.plugin(mongoose_auto_increment.plugin, 'Category');

exports = module.exports = mongoose.model('category', CategorySchema);
