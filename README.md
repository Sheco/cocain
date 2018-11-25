This is a simple cost calculator, it can be used to calculate the cost of different kinds of projects, taking into account the needed resources and how much of each resource is needed for each resulting product.                                                                
                                                                        
It uses a JSON file as input and returns a JSON string as output.          
           
Command line interface
======================

The calculate.js script can be used on the command line to test the recipes, for example:                                                   
                                                                        
```                                                                     
$ ./calculate.js samples/chocomilk.js                                   
{ resources:
   [ { resource: 'liquid',
       name: 'milk',
       cost: 45,
       waste: 360,
       consumed: 2640,
       unit: 'mL' },
     { resource: 'powder',
       name: 'chocolate',
       cost: 18.5,
       waste: 10,
       consumed: 150,
       unit: 'g' } ],
  message: 'Ran out of resources: Not enough chocolate',
  products: 10,
  totalCost: 63.5,
  costPerProduct: 6.35 }

```                       

Web API/Application
===============

The webapp directory includes an API that can be used to send a json recipe, on an /api endpoint which then returns the json output, for example:

```
$ curl https://cost-calc-api.herokuapp.com/api --data-urlencode src@samples/chocomilk.json
{"resources":[{"resource":"liquid","name":"milk","cost":45,"waste":360,"consumed":2640,"unit":"mL"},{"resource":"powder","name":"chocolate","cost":18.5,"waste":10,"consumed":150,"unit":"g"}],"message":"Ran out of resources: Not enough chocolate","products":10,"totalCost":63.5,"costPerProduct":6.35}
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
            // for example, liquid:
            "resource": "liquid",
            // amount is the total amount of liquid acquired, in mL.
            // if the amount is not specified, the resource is infinite
            // so be careful when not specifying a number of products.
            "amount": 3000,
            // container is the size of the container, in mL.
            "container": 1000,
            // fixedCost is the cost of each container
            "fixedCost": 15
        },
        // powder behaves very similarly to liquids, but the units are in grams
        {
            "name": "chocolate",
            "resource": "powder",
            "amount": 160,
            "container": 160,
            "fixedCost": 18.5
        },
        // gas has a very particular behaviour, kilometers are consumed instead of liters
        // to make it easier to measure trips, to make this work, we need to specify the price per liter
        // and the vehicle's mileage
        {
          "name": "gas",
          "resource": "gas",
          "amount": 5,
          "price": 19,
          "mileage": 14
        }
    ],
    
    // After that, we need to specify the recipe's consumption components
    "components": {
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
}
```
