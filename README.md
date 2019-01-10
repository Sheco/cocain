# Cost Calculator Interface

This is a simple cost calculator interface, it can be used to calculate the cost of different kinds of projects, taking into account the needed resources and how much of each resource is needed for each resulting product.

It uses a JSON file as input and returns a JSON string as output.

It's mostly an experiment so I could learn Javascript and Node.js, it has been fun.

I used multiple different techniques and technologies, for example:

- Express for the webserver (using multiple MiddleWares), it uses pug templates.
- the src/calculator.js file uses Javascript classes (ES6)
- the src/TransformCsv.js is a stream Transformer, to convert a file stream into an object stream.
- The files in bin use chained promises.
- There's a basic test suite in bin/test.js
- It can be published to Heroku


Web API/Application
===============

```src/expressApp.js``` defines an ExpressJs WebApp, it manages each module of the recipe with what look like multiple Single Page Apps, while avoiding to have everything on a single monolothical page, making it easier to test and debug.

It also includes an API that can be used to send a json recipe, on an /api endpoint which then returns the json output, for example:

```
$ curl https://cocain.herokuapp.com/api --data-urlencode src@samples/chocomilk.json | json
```

It also includes a basic web form on the /old endpoint, which shows how to use the API in a web form.

It can be easily deployed to Heroku and it's currently hosted in [https://cocain.herokuapp.com/](https://cocain.herokuapp.com/)

Command line interface
======================

The ```bin/calculate.js``` script can be used on the command line to test the recipes, for example:

```
$ bin/calculate.js samples/chocomilk.json  | json
{
  "resources": [
    {
      "name": "milk",
      "capacity": 1000,
      "cost": 1,
      "realAmount": 15,
      "consumed": 14400,
      "left": 600,
      "finalCost": 15,
      "wastePcnt": 0,
      "totalUsed": 15000
    },
    {
      "name": "chocolate",
      "capacity": 400,
      "cost": 2,
      "realAmount": 3,
      "consumed": 900,
      "left": 300,
      "finalCost": 6,
      "wastePcnt": 0,
      "totalUsed": 1200
    }
  ],
  "products": [
    {
      "info": {
        "name": "Chocolate milk",
        "amount": 60,
        "realAmount": 60,
        "cost": 21
      },
      "recipe": [
        {
          "resource": "milk",
          "amount": 240,
          "consumed": 14400,
          "consumedEffective": 15000,
          "cost": 15
        },
        {
          "resource": "chocolate",
          "amount": 15,
          "consumed": 900,
          "consumedEffective": 1200,
          "cost": 6
        }
      ]
    }
  ]
}

```

Input JSON structure
====================

The input has to be a specifically crafted JSON file following the guidelines described below.

The comments here are just for documentation, they are not valid JSON contents.

```
{
  // an array of initial resources that will be available for consumption
  "resources": [
    {
      // the name is the resource's code name, it will be used to
      // reference this particular object.
      "name":"milk",
      
      // the resource is the type of resource, there are some different types
      // that behave differently, their behavior is described in the src/resources directory
      // standard is the default and the following line might be omited:
      "type": "standard",
      
      // capacity is the size of the container/batch, how many units fit in this resource
      // it's the indivisible size of this resource, using less than this
      // will result in wasted resources, the cost will be that of
      // the entirety of the container/batch
      "capacity": 1000,
      
      // amount is the total units this resource has
      // if it has a capacity, then it's multipled by that amount
      // if the amount is not specified, the resource is infinite
      "amount": 3000,

      // if the resource has a capacity cost is the price per container
      // otherwise it is the price per unit
      "cost": 15
    },
    // gas has a very particular behaviour, disance is consumed instead of liters
    // to make it easier to measure trips, to make this work, we need to specify the price per liter
    // and the vehicle's mileage
    {
      "name": "gas",
      "type": "gas-per-distance",

      // like above, the amount is optional
      "amount": 5,
      
      // cost per liter or galon
      "cost": 19,
      
      // mileage is the distance per liter or galon
      "mileage": 14
    }
  ],

  // Then this is where the recipe says how many resources are needed per product
  "products": [
    "info": {
      // descriptive name, currently not really needed
      "name": "Chocomilk",

      // the amount of products to make, if absent or zero, the calculator will try
      // to make as many products until it runs out of resources
      "amount": 0,
    }
    recipe: {
      {
        "resource":"milk",
        "amount": 240
      },
      {
        "resource":"chocolate",
        "amount": 15
      }
    }
  ]
}
```

Converting a CSV file into JSON
===============================

There's a way to write the recipe using a CSV file, which means you can use a Spreadsheet app like Microsoft Excel to manage the recipe, which is a lot easier than writing the JSON object, this is a legacy interface, now replaced entirel by the new web interface.

There is a sample csv file in the samples directory, called candies.csv

The structure of the CSV is quite simple:

A row whose first column is not empty will start the  resource definition parsing, in simple terms, they describe the columns for the data below them.

For example:

|           |            |          |        |         |                           |
| --------- | ---------- | -------- | ------ | ------- | ------------------------- |
| resources | name       | capacity | amount | cost    |                           |
|           | sugar      | 1000     | 1      | 25      | bag with 1000gr           |
|           | coloring   | 10       | 0      | 18      | bottle with 10ml          |
|           | water      | 1        | 0      | 0.00125 | water per ml              |
| info      | name       | amount   |        |         |                           |
|           | candies    | 0        |        |         |                           |
| product   | resource   | amount   |        |         |                           |
|           | sugar      | 5        |        |         | 5gr per candy             |
|           | coloring   | 0.05     |        |         | 1 drop (0.05ml)           |
|           | water      | 5        |        |         | 1ml of water              |


The resources group will define the stock resources that will be available for the recipe, in this case, 1 bag with 1000gr of sugar and an undefined number of bottles of food coloring. it's worth pointing out that the last column is completely ignored by the application.

Then there's an info block, describes a product, with a name and amount columns, these will be the recipe basic information, if the amount is 0, then it will be automatically calculated based on the amount of resources, so one of the resources has to have an amount.


If all of the resources have undefined amounts (infinite) then you need to specify an amount of products to make, in the info group.

Then the setup group will define how many resources are going to be spend before starting to make the products.

And finally, the product group will define how many resources are needed for each product.
