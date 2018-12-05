#!/usr/bin/env node
const calculator = require('../src/calculator')
const TransformCsv = require('../src/TransformCsv')
const webserver = require('../src/webserver')

const csv = require('csv-parse')
const fs = require('fs')
const assert = require('assert').strict
const request = require('request-promise')
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
  let expected = readFile(`tests/${file}.txt`)

  tests[method](`samples/${file}`)
    .then(async data => assert.equal(data + '\n', (await expected).toString()))
    .then(() => console.log(`${file}: Ok`))
    .catch(err => console.error(`${file} ${err.message}`))
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

async function testHttp (label, promise, test) {
  try {
    let data = await promise
    if (test) test(data)

    console.log(`Testing ${label}: Ok`)
  } catch (error) {
    console.error(`Testing ${label}: ${error.message}`)
  }
}

let port = 9999
let baseURL = `http://localhost:${port}`

webserver.listen(port, async function () {
  await testHttp('/', request(baseURL), data => {
    assert(/Cost Calculator Interface/.test(data))
  })

  await testHttp('Empty /api', assert.rejects(
    request.post(baseURL + '/api', { csv: '' })
  ))

  await testHttp('Invalid /api', assert.rejects(
    request.post(baseURL + '/api', { csv: 'undefined' })
  ))

  let src = (await readFile('samples/chocomilk.json')).toString()
  await testHttp('Valid /api', assert.doesNotReject(
    request.post(baseURL + '/api').form({ src: src })
  ))

  await testHttp('Empty /converCSV', assert.rejects(
    request.post(baseURL + '/convertCsv')
  ))

  await testHttp('Valid /convertCsv', assert.doesNotReject(
    request.post({
      url: baseURL + '/convertCsv',
      formData: {
        csv: fs.createReadStream('samples/chocomilk.csv')
      }
    })
  ))

  this.close()
})
