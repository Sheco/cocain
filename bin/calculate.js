#!/usr/bin/env node
const calculator = require('../src/calculator')
const fs = require('fs')
const util = require('util')
const readFile = util.promisify(fs.readFile)

let source = process.argv[2]
readFile(source)
  .then(data => JSON.parse(data))
  .then(data => calculator(data))
  .then(data => JSON.stringify(data))
  .then(data => console.log(data))
  .catch(e => console.error(e))
