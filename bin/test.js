#!/usr/bin/env node
const calculator = require('../src/calculator')
const TransformCsv = require('../src/TransformCsv')
const csv = require('csv-parse')
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
    return new Promise((resolve, reject) => {
      fs.createReadStream(file)
        .on('error', error => reject(error))
        .pipe(csv({ relax_column_count: true }))
        .pipe(new TransformCsv())
        .on('data', data => resolve(data))
    })
  }
}

function test (method, file) {
  readFile(`tests/${file}.json`)
    .then(buffer => {
      tests[method](`samples/${file}`)
        .then(data => assert.equal(data + '\n', buffer.toString()))
        .then(() => console.log(`${file}: Ok`))
        .catch(err => console.error(`${file} ${err.message}`))
    })
}

function testRejects (method, file) {
  assert.rejects(tests[method](file))
    .catch(e => console.error(`${file}: ${e.message}`))
}

// assert some errors
testRejects('csv', 'nosuchfile.csv')
testRejects('json', 'nosuchfile.json')

// test csv results
test('csv', 'chocomilk.csv')
test('csv', 'candies.csv')

// To repopulate the test results recalculating everything, do this
// (it's not recommended unless you're sure the results are correct)
// (cd samples; for f in *.json; do ../bin/calculate.js $f > ../tests/$f.json; done)

// test the json samples
test('json', 'bibs.json')
test('json', 'chocoavena.json')
test('json', 'chocomilk5liters.json')
test('json', 'chocomilk.json')
test('json', 'stickers.json')
test('json', 'tree.json')

// TODO: add tests for the webserver
// - load index
// - test /api with certain payload
// - test /convertJSON with certain file
