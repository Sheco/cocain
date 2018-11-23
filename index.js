const recipe = require('./recipe');
const fs = require('fs');

let source = process.argv[2];
fs.promises.readFile(source)
.then(data => recipe(JSON.parse(data)))
.then(data => JSON.stringify(data))
.then(data => console.log(data))
.catch(e => console.error(e));

