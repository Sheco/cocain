#!/usr/bin/env node
const calculator = require('../src/calculator')
const convertCsv = require('../src/convertCsv')
const fs = require('fs')
const assert = require('assert').strict
const util = require('util')
const readFile = util.promisify(fs.readFile)

const tests = {
  json: function (file) {
    return readFile(file)
      .then(data => JSON.parse(data))
      .then(data => calculator(data))
      .then(data => JSON.stringify(data))
  },
  csv: function (file) {
    return convertCsv(fs.createReadStream(file))
      .then(data => JSON.stringify(data))
  }
}

function assertPromise (method, file) {
  readFile(`tests/${file}.json`)
    .then(buffer => {
      tests[method](`samples/${file}`)
        .then(data => assert.equal(data, buffer.toString()))
        .then(() => console.log(`${file}: Ok`))
        .catch(err => console.error(`${file} ${err.message}`))
    })
}

// assert some errors
assert.rejects(tests.csv('nosuchfile.csv'))
assert.rejects(tests.json('nosuchfile.json'))

// test csv results
assertPromise('csv', 'chocomilk.csv')

// test the json samples
// for f in samples/*; do echo "assertPromise('csv', '$f', '$(./calculate.js $f)')"; done 2>/dev/null
assertPromise('json', 'bibs.json')
assertPromise('json', 'chocoavena.json')
assertPromise('json', 'chocomilk5liters.json')
assertPromise('json', 'chocomilk.json')
assertPromise('json', 'stickers.json')
assertPromise('json', 'tree.json')
