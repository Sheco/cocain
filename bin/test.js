#!/usr/bin/env node
const calculator = require('../src/calculator')
const TransformCsv = require('../src/TransformCsv')
const webserver = require('../src/webserver')

const csv = require('csv-parse')
const fs = require('fs')
const assert = require('assert').strict
const request = require('request-promise')
const util = require('util')
const path = require('path')

const readFile = util.promisify(fs.readFile)

const tests = {
  json: function (file) {
    return readFile(path.join(__dirname, '..', file))
      .then(data => JSON.parse(data))
      .then(data => calculator(data))
      .then(data => JSON.stringify(data))
  },
  csv: function (file) {
    return new Promise((resolve, reject) => {
      fs.createReadStream(path.join(__dirname, '..', file))
        .on('error', error => reject(error))
        .pipe(csv({ relax_column_count: true }))
        .pipe(new TransformCsv())
        .on('data', data => resolve(data))
    })
  }
}

async function testPromise (label, promise) {
  await promise.then(data => {
    console.log(`Testing ${label}: OK`)
  }).catch(error => {
    console.error(`Testing ${label}: ${error.message}`)
  })
}

function testFile (method, file) {
  testPromise(file, tests[method](`samples/${file}`)
    .then(async (data) => {
      file = path.join(__dirname, '..', 'tests', `${file}.txt`)
      let expected = readFile(file)
      assert.equal(data + '\n', (await expected).toString())
      return data
    }))
}

// assert some errors
testPromise('Invalid CSV', assert.rejects(tests.csv('nosuchfile.csv')))
testPromise('Invalid JSON', assert.rejects(tests.json('nosuchfile.json')))

// test csv results
testFile('csv', 'chocomilk.csv')
testFile('csv', 'candies.csv')

// To repopulate the test results recalculating everything, do this
// (it's not recommended unless you're sure the results are correct)
// (cd samples; for f in *.json; do ../bin/calculate.js $f > ../tests/$f.json; done)

// test the json samples
testFile('json', 'bibs.json')
testFile('json', 'chocoavena.json')
testFile('json', 'chocomilk5liters.json')
testFile('json', 'chocomilk.json')
testFile('json', 'stickers.json')
testFile('json', 'tree.json')

let port = 9999
let baseURL = `http://localhost:${port}`

webserver.listen(port, '127.0.0.1', async function () {
  await testPromise('/', request(baseURL)
    .then(data => {
      assert(/Cost Calculator Interface/.test(data))
      return data
    })
  )

  await testPromise('Empty /api', assert.rejects(
    request.post(baseURL + '/api', { csv: '' })
  ))

  await testPromise('Invalid /api', assert.rejects(
    request.post(baseURL + '/api', { csv: 'undefined' })
  ))

  await testPromise('Valid /api', assert.doesNotReject(
    request.post(baseURL + '/api')
      .form({ src: JSON.stringify({
        resources: [],
        product: []
      })
      })
  ))

  await testPromise('Empty /converCSV', assert.rejects(
    request.post(baseURL + '/convertCsv')
  ))

  await testPromise('Valid /convertCsv', assert.doesNotReject(
    request.post({
      url: baseURL + '/convertCsv',
      formData: {
        csv: fs.createReadStream(path.join(__dirname,
          '..', 'samples', 'chocomilk.csv'))
      }
    })
  ))
  this.close()
})
