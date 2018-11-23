
function make_recipe(data) {
    data.errors = [];
    data.cost = 0;

    const consume = function (name, amount) {
        let c = data.resources[name];
        if(c===undefined) {
            data.errors.push(`No resource for ${name}`);
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
        for(let [name, amount] of Object.entries(components)) {
            if(!consume(name, amount*total))
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
        for(let [name, vars] of Object.entries(data.resources)) {
            let src = require('./resources/'+name);
            vars.cost = src.fixedCost(vars)+
                (src.unitCost(vars)*vars.consumed);

            total += vars.cost;
        }
        data.cost = total;
    }
    make();
    return data;
}

module.exports = make_recipe;
