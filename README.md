This is a simple cost calculator, it can be used to calculate the cost of different kinds of projects, taking into account the needed resources and how much of each resource is needed for each resulting product.

It uses a JSON file as input and returns a JSON string as output.
Command line interface
======================

The calculate.js script can be used on the command line to test the recipes, for example:

```
$ ./calculate.js samples/chocomilk.json  | json
{
  "products": 60,
  "cost": 336,
  "costPerProduct": 5.6,
  "wastePcnt": 49,
  "resources": [
    {
      "name": "milk",
      "amount": 15,
      "cost": 225,
      "consumed": 14400,
      "left": 600,
      "wastePcnt": 60
    },
    {
      "name": "chocolate",
      "amount": 6,
      "cost": 111,
      "consumed": 900,
      "left": 60,
      "wastePcnt": 38
    }
  ]
}

```

Web API/Application
===============

The webapp directory includes an API that can be used to send a json recipe, on an /api endpoint which then returns the json output, for example:

```
$ curl https://cost-calc-api.herokuapp.com/api --data-urlencode src@samples/chocomilk.json | json
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  1905  100   253  100  1652    698   4563 --:--:-- --:--:-- --:--:--  5247
{
  "products": 60,
  "cost": 336,
  "costPerProduct": 5.6,
  "wastePcnt": 49,
  "resources": [
    {
      "name": "milk",
      "amount": 15,
      "cost": 225,
      "consumed": 14400,
      "left": 600,
      "wastePcnt": 60
    },
    {
      "name": "chocolate",
      "amount": 6,
      "cost": 111,
      "consumed": 900,
      "left": 60,
      "wastePcnt": 38
    }
  ]
}
```

It also includes a basic web form on the / endpoint, which shows how to use the API in a web form.

It can be easily deployed to Heroku and it's currently hosted in [https://cost-calc-api.herokuapp.com/](https://cost-calc-api.herokuapp.com/)

Input JSON structure
====================

The input has to be a specifically crafted JSON file following the guidelines described below.

The comments here are just for documentation, they are not valid JSON contents.

```
{
    // descriptive name, currently not really needed
    "name": "Chocomilk",

    // the amount of products to make, if absent or zero, the calculator will try
    // to make as many products until it runs out of resources
    "amount": 0,

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

    // After that, we need to specify the recipe's consumption components
    // general components are only consumed once at the beginning of the process
    "general": [
        // for example, this recipe will always consume at least 4km of gas
        {
            "resource": "gas",
            "amount", 4
         },
    ],

    // Then this is where the recipe says how many resources are needed per product
    "product": [
        {
            "resource":"milk",
            "amount": 240
        },
        {
            "resource":"chocolate",
            "amount": 15
        }
    ]
}
```

Converting a CSV file into JSON
===============================

There's a handy way to write the recipe using a CSV file,
which means you can use a Spreadsheet app like Microsoft Excel to
manage the recipe, which is a lot easier than writing the JSON object.

There is a sample csv file in the samples directory, called chocomilk.csv

The structure of the CSV is quite simple:

 A row whose first column is not empty will start the
 resource definition parsing, in simple terms, they describe the
 columns for the data below them.

For example:

|           |            |          |        |      |
| --------- | ---------- | -------- | ------ | ---- |
| info      | name       | amount   |        |      |
|           | chokoko    | 0        |        |      |
| resources | name       | capacity | amount | cost |
|           | chocolate  | 1000     | 10     | 30   |

The first line, info describes a name and an amount columns, these will
be placed in the JSON's root

```
{
  "name": "chokoko",
  "amount": "0"
}
```

Then the resources line will define the columns for the objects that
will be added to the resources property:

```
{
  resources: [
    {
      name: 'chocolate',
      capacity: 1000,
      amount: 10,
      cost: 30
    }
  ]
}
```

