const recipe = require('./recipe');
const fs = require('fs');

fs.promises.readFile('db/bibs.json')
.then(data => {
    let bibs = new recipe(JSON.parse(data));
    console.log(bibs);
    if(bibs.make(10)) {
        bibs.report();
    }
});
