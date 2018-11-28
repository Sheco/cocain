#!/usr/bin/env node
const calculate = require('./src')
const fs = require('fs')
const util = require('util')
const readFile = util.promisify(fs.readFile)

async function assertJSON (file, result) {
  return readFile(file)
    .then(data => JSON.parse(data))
    .then(data => calculate(data))
    .then(data => JSON.stringify(data))
    .catch(e => console.error(e))
}

async function runTests () {
  for (let i = 0; i < 100000; i++) {
    await assertJSON('samples/chocomilk.json', '{"products":60,"cost":336,"costPerProduct":5.6,"wastePcnt":49,"resources":[{"name":"milk","amount":15,"cost":225,"consumed":14400,"left":600,"wastePcnt":60},{"name":"chocolate","amount":6,"cost":111,"consumed":900,"left":60,"wastePcnt":38}]}')
  }
}

runTests()
