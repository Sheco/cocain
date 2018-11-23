
function make_recipe(data) {
    data.errors = [];
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
            data.errors.push(`Not enough resources of ${name}`);
            return false;
        }

        if((c.amount===undefined || c.amount>amount)) {
            if(c.amount!==undefined) 
                c.amount -= amount;
            c.consumed = c.consumed===undefined? amount: c.consumed+amount;

            return true;
        }
        data.errors.push(`Can't consume ${amount.toFixed(2)} of ${name}`);
        return false;
    }

    const consumeMany = function(components, total) {
        for(let component of components) {
            if(!consume(component.resource, component.amount*total))
                return false;
        }
        return true;
    }

    const make = function() {
        let components = data.components;
        if(!consumeMany(components.general, 1))
            return false;
        if(!consumeMany(components.perUnit, data.amount))
            return false;

        calculateCost();
        return true;
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
    make();
    return data;
}

module.exports = make_recipe;
