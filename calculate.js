#!/usr/bin/env node
const calculate = require('./src');
const fs = require('fs');

let source = process.argv[2];
fs.promises.readFile(source)
.then(data => JSON.parse(data))
.then(data => calculate(data))
//.then(data => JSON.stringify(data))
.then(data => console.log(data))
.catch(e => console.error(e));

