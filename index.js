const receta = require('./receta');
const fs = require('fs');

fs.readFile('db/baberos.json', (err, data) => {
    data = JSON.parse(data);
    let baberos = new receta(data);
    if(baberos.preparar(10)) {
        baberos.reporte();
    }
});
