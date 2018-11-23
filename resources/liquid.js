module.exports = {
    unit: 'mL',
    fixedCost: function(vars) {
        return vars.fixedCost*Math.ceil((vars.consumed+vars.amount)/vars.container) || 0;
    },
    unitCost: function(vars) {
        return vars.unitCost || 0;
    }
}

