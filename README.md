This is a simple cost calculator, it can be used to calculate the cost of different kinds of projects, taking into account the needed resources and how much of each resource is needed for each resulting product.                                                                
                                                                        
It uses a JSON file as input and returns a JSON string as output.          
           
Command line interface
======================

The calculate.js script can be used on the command line to test the recipes, for example:                                                   
                                                                        
```                                                                     
$ ./calculate.js samples/chocomilk.json  | json
(node:26887) ExperimentalWarning: The fs.promises API is experimental
{
  "products": 60,
  "total": 336,
  "costPerProduct": 5.6,
  "wastePcnt": 49,
  "resources": [
    {
      "name": "milk",
      "cost": 225,
      "consumed": 14400,
      "waste": 600,
      "wastePcnt": 60
    },
    {
      "name": "chocolate",
      "cost": 111,
      "consumed": 900,
      "waste": 60,
      "wastePcnt": 38
    }
  ]
}

```                       

Web API/Application
===============

The webapp directory includes an API that can be used to send a json recipe, on an /api endpoint which then returns the json output, for example:

```
$ curl https://cost-calc-api.herokuapp.com/api --data-urlencode src@samples/chocomilk.json
$ curl https://cost-calc-api.herokuapp.com/api --data-urlencode src@samples/chocomilk.json | json
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  1905  100   253  100  1652    698   4563 --:--:-- --:--:-- --:--:--  5247
{
  "products": 60,
  "total": 336,
  "costPerProduct": 5.6,
  "wastePcnt": 49,
  "resources": [
    {
      "name": "milk",
      "cost": 225,
      "consumed": 14400,
      "waste": 600,
      "wastePcnt": 60
    },
    {
      "name": "chocolate",
      "cost": 111,
      "consumed": 900,
      "waste": 60,
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
            // container is the size of the container, how many units fit in this resource
            "capacity": 1000,
            // amount is the total units this resource has
            // if it has a capacity, then it's amount*capacity
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
