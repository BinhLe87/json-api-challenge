'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');
var mongoose_auto_increment = require('mongoose-auto-increment');
var mongoose_timezone = require('mongoose-timezone');

mongoose_auto_increment.initialize(mongoose.connection);

var TransactionSchema = new Schema({

    lastModified: Date,
    state: {
        type: String,
        default: "initial",
        index: true
    },
    data:{},
    _id:false
});


TransactionSchema.plugin(timestamps);
TransactionSchema.plugin(mongoose_timezone);
//TransactionSchema.plugin(mongoose_auto_increment.plugin, 'Transaction');

exports = module.exports = mongoose.model('transaction', TransactionSchema);
