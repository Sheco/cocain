module.exports = {
    nombre: 'Baberos 38cm²',
    recursos: {
        microfibra: {
            cantidad: 150*100,
            costoFijo: 70,
        },
        gasolina: {
            rendimiento: 14/*km/l*/,
            precioLitro: 19.7/*$*/
        },
        natalia: {
        },
    },
    componentes: {
        generales: {
            gasolina: 5/*km*/,
        },
        unidad: {
            microfibra: 38*38/*cm*/,
            natalia: 1/(60/10)/*horas*/,
        }
    }
}
