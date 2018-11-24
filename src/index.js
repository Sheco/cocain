// When making as many products as possible, don't let it run for too long
const timeLimit=2000;

function make_recipe(data) {
    // make a hard copy of the data object,
    // to avoid modifying it directly
    data = {...data};

    const findResource = function(name, amount) {
        for(let resource of data.resources)
        {
            if(resource.name!=name)
                continue;

            if(resource.amount===undefined || resource.amount>amount)
                return resource;
        }
    }

    const consume = function (name, amount) {
        let c = findResource(name, amount);

        if(c===undefined) {
            throw(`Not enough ${name}`);
        }

        if(c.amount!==undefined) 
            c.amount -= amount;

        c.consumed = (c.consumed || 0)+amount;
    }

    const consumeGroup = function(components, total) {
        if(!components)
            return 0;

        for(let component of components) {
            consume(component.resource, component.amount*total);
        }

        return total;
    }

    const make = function() {
        let components = data.components;
        let ret = {
            resources: [],
            message: '',
            products: 0
        }

        consumeGroup(components.general, 1);

        if(data.amount>0)  {
            ret.products += consumeGroup(components.product, data.amount);
        } else {
            let start = new Date().valueOf();

            try {
                while(true) {
                    ret.products += consumeGroup(components.product, 1);

                    let now = new Date().valueOf();
                    if(now-start>timeLimit) {
                        throw(`It took longer than ${timeLimit}ms`);
                    }
                }
            } catch(e) {
                ret.message = 'Ran out of resources: '+e;
            }
        }
        return ret;
    }

    const calculateCost = function() {
        for(let resource of data.resources) {
            let src = require('./resources/'+resource.resource);
            resource.cost = Math.round((src.fixedCost(resource)+
                (src.unitCost(resource)*resource.consumed))*100)/100;
        }
    }

    const process = function() {
        let result = make();

        calculateCost();

        for(let resource of data.resources) {
            let src = require('./resources/'+resource.resource);
            result.resources.push({
                resource: resource.resource,
                name: resource.name,
                cost: resource.cost,
                waste: resource.amount,
                consumed: resource.consumed,
                unit: src.unit,
            });
        }
        result.totalCost = Math.round(result.resources
            .reduce((total,res) => total+res.cost, 0)*100)/100;
        result.costPerProduct = Math.round(result.totalCost/result.products*100)/100;
        return result;
    }

    return process();
}

module.exports = make_recipe;
