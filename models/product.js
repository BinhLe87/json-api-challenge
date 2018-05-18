'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');
var mongoose_auto_increment = require('mongoose-auto-increment')

mongoose_auto_increment.initialize(mongoose.connection);

var ProductSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        validate: function(v) {
            return v > 0;
        }
    },
    description: String,
    tags: [String],
    category: {
        type: Number,
        ref: 'Category'
    }
});


ProductSchema.plugin(timestamps);
ProductSchema.plugin(mongoose_auto_increment.plugin, 'Product');

exports = module.exports = mongoose.model('product', ProductSchema);
