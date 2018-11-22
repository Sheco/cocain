const receta = require('./receta');
const fs = require('fs');
const JSON5 = require('json5');

fs.readFile('db/baberos.json', (err, data) => {
    data = JSON5.parse(data);
    let baberos = new receta(data);
    if(baberos.preparar(10)) {
        baberos.reporte();
    }
});
