module.exports = {
    unidad: 'km',
    costoFijo: function(vars) {
        return vars.costoFijo || 0;
    },
    costoUnidad: function(vars) {
        return Math.round((vars.precioLitro/vars.rendimiento)*100)/100;
    }
}
