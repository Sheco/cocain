module.exports = {
    unit: 'km',
    fixedCost: function(vars) {
        return vars.fixedCost || 0;
    },
    unitCost: function(vars) {
        return Math.round((vars.price/vars.mileage)*100)/100;
    }
}
