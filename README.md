# json-api-challenge

Module demo for handle requests that obey Json API specification, reference at [jsonapi.org](http://jsonapi.org/format/).

## Installation
- Run `npm install` to download all dependency modules
- Create MongoDB called `shopback` (you can modify db string connection in `./lib/config/db.js`)
- Run scripts to generate data for demo purpose at path `./data`. Run file `gen.categories.js` first, then run file `gen.products.js`.
- Run command `npm run start` to build and run on port 3000 as configuration in `./env` file.


## Features

  * `http://127.0.0.1:3000/product` to query all products
  * `http://127.0.0.1:3000/product/{product_id}/category` to query category of the specificed product
  * `http://127.0.0.1:3000/category/{cat_id}/product` to query all products belong to a category

## Test submit API and fetch response data on demo purpose

  * Submit `GET` request [`http://127.0.0.1:3000/product?page[number]=1&page[size]=2`](http://127.0.0.1:3000/product?page[number]=1&page[size]=2)

```
{
    "type": "product",
    "data": [
        {
            "type": "product",
            "id": 1,
            "attributes": {
                "name": "product_682264945725874",
                "price": 50,
                "description": "description of product_682264945725874",
                "tags": [
                    "electronics"
                ]
            },
            "relationships": {
                "category": {
                    "data": {
                        "type": "category",
                        "id": 1
                    }
                }
            }
        },
        {
            "type": "product",
            "id": 2,
            "attributes": {
                "name": "product_064170390401246",
                "price": 60,
                "description": "description of product_064170390401246",
                "tags": [
                    "baby"
                ]
            },
            "relationships": {
                "category": {
                    "data": {
                        "type": "category",
                        "id": 4
                    }
                }
            }
        }
    ],
    "meta": {
        "total_count": 300,
        "page_no": 1,
        "page_size": 2,
        "total_page": 150
    },
    "errors": null
}
```

  * Submit `GET` request [`http://127.0.0.1:3000/product/1/category`](http://127.0.0.1:3000/product/1/category)

```
{
    "data": {
        "type": "category",
        "id": 1,
        "attributes": {
            "name": "category_21139094588238594",
            "description": "description of category_21139094588238594",
            "parent": null,
            "image": "http://api.coachingcloud.com/images/image_21139094588238594.jpg",
            "count": 0
        }
    }
}
```

  * Submit `GET` request [`http://127.0.0.1:3000/category/1/product?page[number]=1&page[size]=2`](http://127.0.0.1:3000/category/1/product?page[number]=1&page[size]=2)

```
{
    "data": [
        {
            "type": "product",
            "id": 68,
            "attributes": {
                "name": "product_485096571447311",
                "price": 40,
                "description": "description of product_485096571447311",
                "tags": [
                    "baby"
                ]
            }
        },
        {
            "type": "product",
            "id": 70,
            "attributes": {
                "name": "product_848352035796952",
                "price": 50,
                "description": "description of product_848352035796952",
                "tags": [
                    "food"
                ]
            }
        }
    ],
    "meta": {
        "total_count": 71,
        "page_no": 1,
        "page_size": 2,
        "total_page": 36
    },
    "errors": []
}
```