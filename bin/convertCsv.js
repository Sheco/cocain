#!/usr/bin/env node
'use strict'

const TransformCsv = require('../src/TransformCsv')
const fs = require('fs')

let source = process.argv[2]
TransformCsv.csv(fs.createReadStream(source))
  .then(console.log)
  /*
  .then(JSON.parse)
  .then(calculator)
  .then(JSON.stringify)
  .then(console.log)
  .catch(console.error)
  */

