#!/usr/bin/env node
'use strict'

const calculator = require('../src/calculator')
const fs = require('fs')
const util = require('util')
const readFile = util.promisify(fs.readFile)

let source = process.argv[2]
readFile(source)
  .then(JSON.parse)
  .then(calculator)
  .then(JSON.stringify)
  .then(console.log)
  .catch(console.error)
