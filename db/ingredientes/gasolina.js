module.exports = {
    unidad: 'km',
    costoUnidad: function() {
        return Math.round(this.consumido*(this.precioLitro/this.rendimiento)*100)/100;
    }
}
