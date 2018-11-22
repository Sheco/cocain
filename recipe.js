
class Recipe {
    constructor(data) {
        this.data = data;
    }

    consume(name, amount) {
        let c = this.data.resources[name];
        if(c===undefined) {
            console.log(`No hay resource para ${name}`);
            return false;
        }

        if((c.amount===undefined || c.amount>amount)) {
            if(c.amount!==undefined) 
                c.amount -= amount;
            c.consumed = c.consumed===undefined? amount: c.consumed+amount;

            return true;
        }
        console.log(`${c.amount}>${amount}`);
        console.log(`No se pudieron consume ${amount.toFixed(2)} de ${name}`);
        return false;
    }

    consumeMany(components, total) {
        for(let [name, amount] of Object.entries(components)) {
            if(!this.consume(name, amount*total))
                return false;
        }
    }

    make(total) {
        this.cleanup();
        console.log(`Making ${total} ${this.data.name}`);

        this.consumeMany(this.data.components.general, 1);
        this.consumeMany(this.data.components.perUnit, total);

        return true;
    }

    cleanup() {
        for(let [name, vars] of Object.entries(this.data.resources)) {
            vars.consumed = 0;
        }
    }

    report() {
        console.log('\nReporte...');
        let total = 0;
        for(let [name, vars] of Object.entries(this.data.resources)) {
            let src = require('./resources/'+name);
            let cost = 0;
            
            if(!vars.fixedCostPaid)  {
                cost = src.fixedCost(vars);
                if(cost>0) {
                    vars.fixedCostPaid = true;
                }
            }

            cost += src.unitCost(vars)*vars.consumed;
            total += cost;

            console.log(`${name}: using ${vars.consumed.toFixed(2)} ${src.unit}: $${cost.toFixed(2)}`)

            
            if(vars.amount>0) {
                console.log(`* ${name} still has ${vars.amount.toFixed(2)} ${src.unit} left`);
            }
        }
        console.log(`\nTotal: $${total.toFixed(2)}`);
        console.log('');
    }
}

module.exports = Recipe;
