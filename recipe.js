
class Recipe {
    constructor(data) {
        this.data = data;
    }

    consume(name, amount) {
        let c = this.data.resources[name];
        if(c===undefined) {
            console.log(`No resource for ${name}`);
            return false;
        }

        if((c.amount===undefined || c.amount>amount)) {
            if(c.amount!==undefined) 
                c.amount -= amount;
            c.consumed = c.consumed===undefined? amount: c.consumed+amount;

            return true;
        }
        console.log(`${c.amount}>${amount}`);
        console.log(`Can't consume ${amount.toFixed(2)} of ${name}`);
        return false;
    }

    consumeMany(components, total) {
        for(let [name, amount] of Object.entries(components)) {
            if(!this.consume(name, amount*total))
                return false;
        }
        return true;
    }

    make() {
        let components = this.data.components;
        if(!this.consumeMany(components.general, 1))
            return false;
        if(!this.consumeMany(components.perUnit, this.data.amount))
            return false;

        this.calculateCost();
        return true;
    }

    calculateCost() {
        let total = 0;
        for(let [name, vars] of Object.entries(this.data.resources)) {
            let src = require('./resources/'+name);
            vars.cost = src.fixedCost(vars)+
                (src.unitCost(vars)*vars.consumed);

            total += vars.cost;
        }
        this.data.cost = total;
    }
}

module.exports = Recipe;
