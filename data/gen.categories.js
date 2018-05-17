var random = require('../node_modules/mongoose/lib/utils').random;
var db = require('../lib/config/db');

db.connect();


let totalDocsNeedToInsert = 10;

for (let i = 1; i <= totalDocsNeedToInsert; i++) {

    let id = random();

    let category = new db.Category({

        name: `category_${id}`,
        description: `description of category_${id}`,
        image: `http://api.coachingcloud.com/images/image_${id}.jpg`
    });

    category.save();
}