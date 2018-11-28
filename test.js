#!/usr/bin/env node
const calculate = require('./src')
const fs = require('fs')
const assert = require('chai').assert
const util = require('util')
const readFile = util.promisify(fs.readFile)

function assertJSON (file, result) {
  readFile(file)
    .then(data => JSON.parse(data))
    .then(data => calculate(data))
    .then(data => JSON.stringify(data))
    .then(data => assert.equal(data, result))
    .then(data => console.log(file + ' OK'))
    .catch(e => console.error(`${file} ${e}`))
}

// test the csv convertor
const convertCsv = require('./src/convertCsv')
function assertCsv (file, result) {
  convertCsv(fs.createReadStream(file))
    .then(data => JSON.stringify(data))
    .then(data => assert.equal(data, result))
    .then(data => console.log(file + ' OK'))
    .catch(e => console.error(`${file} Failed\n${e}`))
}

assertCsv('samples/chocomilk.csv', '{"resources":[{"name":"milk","capacity":"1000","amount":"0","cost":"15"},{"name":"chocolate","capacity":"160","amount":"0","cost":"18.5"}],"setup":[],"product":[{"resource":"milk","amount":"240","":""},{"resource":"chocolate","amount":"15","":""}],"name":"chocomilk","amount":"60"}')

// test the json samples
// for f in samples/*; do echo "assertJSON('$f', '$(./calculate.js $f)')"; done 2>/dev/null
assertJSON('samples/bibs.json', '{"products":10,"cost":76.96,"costPerProduct":7.7,"wastePcnt":4,"resources":[{"name":"fabric","amount":1,"cost":70,"consumed":14440,"left":560,"wastePcnt":4},{"type":"gas-per-distance","name":"gas","amount":2,"cost":2.81,"consumed":2},{"name":"john","amount":50,"cost":4.15,"consumed":50}]}')
assertJSON('samples/chocoavena.json', '{"products":26,"cost":325.6,"costPerProduct":12.52,"wastePcnt":51.33,"resources":[{"name":"milk","amount":6,"cost":90,"consumed":5200,"left":800,"wastePcnt":80},{"name":"water","amount":15600,"cost":15.6,"consumed":15600},{"name":"sugar","amount":1,"cost":30,"consumed":390,"left":610,"wastePcnt":61},{"name":"chocoavena","amount":5,"cost":190,"consumed":1950,"left":50,"wastePcnt":13}]}')
assertJSON('samples/chocomilk5liters.json', '{"products":20,"cost":112,"costPerProduct":5.6,"wastePcnt":16.5,"resources":[{"name":"milk","amount":5,"cost":75,"consumed":4800,"left":200,"wastePcnt":20},{"name":"chocolate","amount":2,"cost":37,"consumed":300,"left":20,"wastePcnt":13}]}')
assertJSON('samples/chocomilk.json', '{"products":60,"cost":336,"costPerProduct":5.6,"wastePcnt":49,"resources":[{"name":"milk","amount":15,"cost":225,"consumed":14400,"left":600,"wastePcnt":60},{"name":"chocolate","amount":6,"cost":111,"consumed":900,"left":60,"wastePcnt":38}]}')
assertJSON('samples/stickers.json', '{"products":479,"cost":198.29,"costPerProduct":0.41,"wastePcnt":0,"resources":[{"name":"vinyl","amount":1,"cost":160,"consumed":14489.75,"left":10.25,"wastePcnt":0},{"type":"gas-per-distance","name":"gas","amount":13,"cost":18.29,"consumed":13},{"name":"john","amount":0.4,"cost":20,"consumed":0.4}]}')
assertJSON('samples/tree.json', '{"products":1,"cost":207.93,"costPerProduct":207.93,"wastePcnt":11,"resources":[{"name":"fieltro","amount":1,"cost":40,"consumed":10000,"left":5000,"wastePcnt":33},{"name":"liston","amount":1,"cost":8,"consumed":200,"left":0,"wastePcnt":0},{"name":"papel","amount":1,"cost":75,"consumed":10000,"left":0,"wastePcnt":0},{"name":"natalia","amount":1,"cost":50,"consumed":1},{"name":"planchado","amount":1,"cost":20,"consumed":1},{"type":"gas-per-distance","name":"gas","amount":11,"cost":14.93,"consumed":11}]}')
