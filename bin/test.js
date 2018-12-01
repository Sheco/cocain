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
        .then(data => assert.equal(data + '\n', buffer.toString()))
        .then(() => console.log(`${file}: Ok`))
        .catch(err => console.error(`${file} ${err.message}`))
    })
}

// assert some errors
assert.rejects(tests.csv('nosuchfile.csv'))
assert.rejects(tests.json('nosuchfile.json'))

// test csv results
assertPromise('csv', 'chocomilk.csv')

// To repopulate the test results recalculating everything, do this
// (it's not recommended unless you're sure the results are correct)
// (cd samples; for f in *.json; do ../bin/calculate.js $f > ../tests/$f.json; done)

// test the json samples
assertPromise('json', 'bibs.json')
assertPromise('json', 'chocoavena.json')
assertPromise('json', 'chocomilk5liters.json')
assertPromise('json', 'chocomilk.json')
assertPromise('json', 'stickers.json')
assertPromise('json', 'tree.json')
