var random = require('../node_modules/mongoose/lib/utils').random;
var db = require('../lib/config/db');
var _ = require('lodash');

db.connect();


let totalDocsNeedToInsert = 300;

//random category
db.Category.find({}).exec(function (err, categories) {

    if (categories) {

        for (let i = 1; i <= totalDocsNeedToInsert; i++) {

            let category_random = _.sample(categories);

            let id = random();

            let product = new db.Product({

                name: `product_${id}`,
                price: _.sample([10, 20, 30, 40, 50, 60]),
                description: `description of product_${id}`,
                tags: _.sample(['baby', 'books', 'clothing', 'electronics', 'food']),
                category: category_random._id
            });

            product.save(function(err, saved_product) {

                if(!err) {

                    category_random.products.push(saved_product._id);
                    category_random.save();
                }
            });
        }


    }
});


