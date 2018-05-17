'use strict';

exports = module.exports = function(req, res, next) {

    var origin_res_send_func = req.send;

    var env = process.env.NODE_ENV || 'development';


    switch (env) {

        case 'development':

            res.send(JSON.stringify(err));
            break;
        case 'production':

            res.status(500).send('Internal error. Please try again later');
            break;
    }
}