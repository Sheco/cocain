module.exports = {
    unidad: 'h',
    costoFijo: function(vars) {
        return vars.costoFijo || 0;
    },
    costoUnidad: function(vars) {
        return vars.costoUnidad || 50;
    }
}
