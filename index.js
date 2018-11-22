const receta = require('./receta');
const fs = require('fs');

fs.promises.readFile('db/baberos.json')
.then(data => {
    let baberos = new receta(JSON.parse(data));
    if(baberos.preparar(10)) {
        baberos.reporte();
    }
});
