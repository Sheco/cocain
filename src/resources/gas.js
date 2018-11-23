/* Gas
 *
 * mandatory variables:
 * price: price per unit (liter/galon)
 * mileage: vehicle's mileage
 *
 * optional variables:
 * amount: the amount of gas you prepurchased, if there's any wasted gas
 *  it will be considered in the cost
 */
module.exports = {
    unit: 'km',
    fixedCost: function(vars) {
        if(vars.amount>0) {
            return Math.round((vars.price/vars.mileage)
                *vars.amount*100)/100;
        }
        return vars.fixedCost || 0;
    },
    unitCost: function(vars) {
        return Math.round((vars.price/vars.mileage)*100)/100;
    }
}
