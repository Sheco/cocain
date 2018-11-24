module.exports = {
    unit: 'h',
    fixedCost: function(vars) {
        return vars.fixedCost || 0;
    },
    unitCost: function(vars) {
        return vars.unitCost || 0;
    }
}
