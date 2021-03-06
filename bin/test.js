#!/usr/bin/env node
'use strict'

const calculator = require('../src/calculator')
const TransformCsv = require('../src/TransformCsv')
const webserver = require('../src/expressApp')

const fs = require('fs')
const assert = require('assert').strict
const request = require('request-promise')
const util = require('util')
const path = require('path')

const readFile = util.promisify(fs.readFile)

/* basic tests, they read a file, parse it and return a string
 * representation of the result */
const tests = {
  json: function (file) {
    return readFile(path.join(__dirname, '..', file), 'utf8')
      .then(JSON.parse)
      .then(calculator)
      .then(JSON.stringify)
  },
  csv: function (file) {
    return TransformCsv.csv(fs.createReadStream(file))
  }
}

/* Simple promise tester, it only really wraps a promise with
 * a success message and a failure message */
function testPromise (label, promise) {
  return promise.then(data => {
    console.log(`Testing ${label}: OK`)
  }).catch(error => {
    console.error(`Testing ${label}: ${error.message}`)
  })
}

/* Makes a promise to read, parse and compare a file to the expected result */
function testFile (method, file) {
  return testPromise(file, tests[method](`samples/${file}`)
    .then(async (data) => {
      file = path.join(__dirname, '..', 'tests', `${file}.txt`)
      let expected = await readFile(file, 'utf8')
      assert.equal(data, expected.trim())
      return data
    }))
}

Promise.all([
// assert some errors
  testPromise('Invalid CSV', assert.rejects(tests.csv('nosuchfile.csv'))),
  testPromise('Invalid JSON', assert.rejects(tests.json('nosuchfile.json'))),

  // test csv results
  testFile('csv', 'chocomilk.csv'),
  testFile('csv', 'candies.csv'),

  // test the json samples
  testFile('json', 'bibs.json'),
  testFile('json', 'chocoavena.json'),
  testFile('json', 'chocomilk5liters.json'),
  testFile('json', 'chocomilk.json'),
  testFile('json', 'stickers.json'),
  testFile('json', 'tree.json')
])

// To repopulate the test results recalculating everything, do this
// (it's not recommended unless you're sure the results are correct)
// (cd samples; for f in *.json; do ../bin/calculate.js $f > ../tests/$f.json; done)

let port = 9999
let baseURL = `http://localhost:${port}`

webserver.listen(port, '127.0.0.1', function () {
  Promise.all([
    testPromise('/', request(baseURL)
      .then(data => {
        assert(/Cost Calculator Interface/.test(data))
        return data
      })
    ),

    testPromise('Empty /api', assert.rejects(
      request.post(baseURL + '/api')
    )),

    testPromise('Invalid /api', assert.rejects(
      request.post(baseURL + '/api', { csv: 'undefined' })
    )),

    testPromise('Valid /api', assert.doesNotReject(
      request.post({
        url: baseURL + '/api',
        json: true,
        body: { src: JSON.stringify({
          resources: [],
          products: []
        })
        }
      })
        .then(JSON.stringify)
        .then(data => {
          let expected = '{"products":[],"resources":[]}'
          assert.equal(data, expected)
        })
    )),

    testPromise('Empty /converCSV', assert.rejects(
      request.post(baseURL + '/convertCsv')
    )),

    testPromise('Valid /convertCsv', assert.doesNotReject(
      request.post({
        url: baseURL + '/convertCsv',
        formData: {
          csv: fs.createReadStream(path.join(__dirname,
            '..', 'samples', 'candies.csv'))
        }
      })
        .then(JSON.parse)
        .then(JSON.stringify)
        .then(async data => {
          let expected = await readFile('tests/candies.csv.txt', 'utf8')
          assert.equal(data, expected.trim())
        })
    )),

    testPromise('Multifile /convertCsv', assert.doesNotReject(
      request.post({
        url: baseURL + '/convertCsv',
        formData: {
          csv: [
            fs.createReadStream(path.join(__dirname, '..', 'samples',
              'resources.csv')),
            fs.createReadStream(path.join(__dirname, '..', 'samples',
              'candies-recipe.csv'))
          ]
        }
      })
        .then(JSON.parse)
        .then(JSON.stringify)
        .then(async data => {
          let expected = await readFile('tests/candies.csv.txt', 'utf8')
          assert.equal(data, expected.trim())
        })
    ))
  ]).then(() => {
    this.close()
  })
})
