
function make_recipe(data) {
    // make a hard copy of the data object,
    // to avoid modifying it directly
    data = {...data}
    data.cost = 0;

    const findResource = function(name, amount) {
        for(let resource of data.resources)
        {
            if(resource.name!=name)
                continue;
            if(resource.amount===undefined)
                return resource;

            if(resource.amount>amount)
                return resource;
        }
    }

    const consume = function (name, amount) {
        let c = findResource(name, amount);
        if(c===undefined) {
            throw(`Not enough resources of ${name}`);
        }

        if(c.amount!==undefined && c.amount<amount) 
            throw(`Can't consume ${amount.toFixed(2)} of ${name}`);

        if(c.amount!==undefined) 
            c.amount -= amount;
        c.consumed = c.consumed===undefined? amount: c.consumed+amount;
    }

    const consumeMany = function(components, total) {
        for(let component of components) {
            consume(component.resource, component.amount*total);
        }
    }

    const make = function() {
        let components = data.components;
        consumeMany(components.general, 1);
        consumeMany(components.perUnit, data.amount);

        calculateCost();
    }

    const calculateCost = function() {
        let total = 0;
        for(let resource of data.resources) {
            let src = require('./resources/'+resource.resource);
            resource.cost = src.fixedCost(resource)+
                (src.unitCost(resource)*resource.consumed);

            total += resource.cost;
        }
        data.cost = total;
    }

    const process = function() {
        make();
        let result = [];
        for(let resource of data.resources) {
            let src = require('./resources/'+resource.resource);
            result.push({
                resource: resource.resource,
                name: resource.name,
                cost: resource.cost,
                waste: resource.amount,
                consumed: resource.consumed,
                unit: src.unit,
            });
        }
        return result;

    }
    return process();
}

module.exports = make_recipe;
