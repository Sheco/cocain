module.exports = {
    unidad: 'cm²',
    costoFijo: function(vars) {
        return vars.costoFijo || 0;
    },
    costoUnidad: function(vars) {
        return vars.costoUnidad || 0;
    },
}
