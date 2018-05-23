'use stricts';

var mongoose = require('mongoose');
var mongoose_conn = mongoose.connection;
var debug = require('debug')('mongooseUtils');
var _ = require('lodash');

exports = module.exports = {};

exports.extractRefsFromSchema = function extractRefsFromSchema(modelName) {

    return new Promise(function(resolve, reject) {

        //check whether this model exists or not
        try {

            var modelObj = mongoose_conn.model(modelName);
        } catch (ex) {

            if (ex.name === 'MissingSchemaError') {
               
                reject(new TypeError(`The model ${modelName} does not exists`))
            }
        }

        var schema = modelObj.schema;
        var refs = [];

        schema.eachPath(function(path, schema_type) {

            //debug(`---${path}---`);
            //debug(schema_type);

            let real_schema_type;
            if (schema_type instanceof mongoose.SchemaTypes.Array) {
                real_schema_type = _.get(schema_type, 'caster');
            } else {
                real_schema_type = schema_type;
            }

            let ref_name;
            let ref_type;

            ref_name = _.get(real_schema_type, 'path');
            ref_type = _.get(real_schema_type, 'options.ref');

            if (ref_name && ref_type) {

                var obj = {};
                obj[ref_name] = ref_type;
                refs.push(obj);
            }
        });

        resolve(refs);

    });
}