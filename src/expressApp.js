'use strict'

const express = require('express')
const multer = require('multer')

const fs = require('fs')
const util = require('util')
const path = require('path')
const StreamConcat = require('stream-concat')
const pug = require('pug')

const readFile = util.promisify(fs.readFile)
const stat = util.promisify(fs.stat)

const calculator = require('../src/calculator')
const TransformCsv = require('../src/TransformCsv')

const upload = multer({ dest: '/tmp' })

const app = express()
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')))

app.get('/old', async (req, res) => {
  let body = readFile(path.join(__dirname, '..', 'assets',
    'index.html'), 'utf8')
  res.send(await body)
})

app.get('/', async (req, res) => {
  let file = path.join(__dirname, '..', 'assets', 'ui.pug')
  res.send(pug.renderFile(file))
})

app.get('/about', (req, res) => {
  let file = path.join(__dirname, '..', 'assets', 'about.pug')
  res.send(pug.renderFile(file))
})

app.get('/examples', (req, res) => {
  let file = path.join(__dirname, '..', 'assets', 'examples.pug')
  res.send(pug.renderFile(file))
})

app.get('/resource', async (req, res) => {
  let file = path.join(__dirname, '..', 'assets', 'resource.pug')
  res.send(pug.renderFile(file, { id: req.query.id || -1 }))
})

app.get('/product', async (req, res) => {
  let file = path.join(__dirname, '..', 'assets', 'product.pug')
  res.send(pug.renderFile(file, { id: req.query.id || -1 }))
})

app.post('/api', express.json(),
  async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*')
    res.type('json')

    try {
      let src = JSON.parse(req.body.src)
      res.send(calculator(src))
    } catch (e) {
      res.status(400)
        .send({ error: e.message })
    }
  })

app.post('/convertCsv', upload.array('csv'), async function (req, res) {
  res.type('json')
  try {
    if (req.files.length === 0) throw Error('No file specified')

    for (let file of req.files) {
      let csvStats = await stat(file.path)
      if (csvStats.size > 10 * 1024) {
        throw Error(`${file.name} is too large, ${csvStats.size}>10KB`)
      }
    }

    let inputStream = new StreamConcat(
      req.files.map(file => fs.createReadStream(file.path))
    )

    let body = await TransformCsv.csv(inputStream)
    res.send(body)
  } catch (error) {
    res.status(400)
      .send({ error: error.message })
  }
})

module.exports = app
