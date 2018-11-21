const receta = require('./receta');

let baberos = new receta('baberos');
if(baberos.preparar(10)) {
    baberos.reporte();
    baberos.limpiar();
}
console.log(baberos);
