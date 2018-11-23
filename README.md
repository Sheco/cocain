This is a simple cost calculator, it can be used to calculate the cost of different kinds of projects, taking into account the needed resources and how much of each resource is needed for each resulting product.                                                                
                                                                        
It uses a JSON file as input and returns a JSON string as output.          
                                                                        
The calculate.js script can be used on the command line to test the recipes, for example:                                                   
                                                                        
```                                                                     
$ ./calculate.js samples/chocomilk.js                                   
Ran out of resources: Not enough resources of chocolate                 
{ resources:                                                            
   [ { resource: 'liquid',                                              
       name: 'milk',                                                    
       cost: 75,                                                        
       waste: 600,                                                      
       consumed: 4400,                                                  
       unit: 'mL' },                                                    
     { resource: 'powder',                                              
       name: 'chocolate',                                               
       cost: 18.5,                                                      
       waste: 10,                                                       
       consumed: 150,                                                   
       unit: 'g' } ],                                                   
  products: 10,                                                         
  totalCost: 93.5,                                                      
  costPerProduct: 9.35 }                                                
```                       
