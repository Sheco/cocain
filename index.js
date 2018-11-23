const recipe = require('./recipe');
const fs = require('fs');

let source = process.argv[2];
fs.promises.readFile(source)
.then(data => {
    data = recipe(JSON.parse(data));
    console.log(JSON.stringify(data));
}).catch(e => {
    console.error(e);
});
