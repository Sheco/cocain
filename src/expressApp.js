'use strict'

const express = require('express')
const multer = require('multer')

const i18next = require('i18next')
const i18nextBackend = require('i18next-node-fs-backend')
const i18nextMiddleware = require('i18next-express-middleware')

const fs = require('fs')
const util = require('util')
const path = require('path')
const StreamConcat = require('stream-concat')

const readFile = util.promisify(fs.readFile)
const stat = util.promisify(fs.stat)

const calculator = require('../src/calculator')
const TransformCsv = require('../src/TransformCsv')

const upload = multer({ dest: '/tmp' })

const app = express()

i18next
  .use(i18nextBackend)
  .use(i18nextMiddleware.LanguageDetector).init({
    backend: {
      loadPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.json'),
      addPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.missing.json')
    },
    detection: {
      order: ['cookie', 'header'],
      lookupCookie: 'lang'
    },
    fallbackLng: 'en',
    preload: ['en', 'es']
  })

app.use(i18nextMiddleware.handle(i18next))
app.get('/lang/:lang', (req, res) => {
  res.cookie('lang', req.params.lang)

  res.redirect('/')
})

app.set('view engine', 'pug')

app.use('/assets', express.static(path.join(__dirname, '..', 'assets')))

app.get('/old', async (req, res) => {
  let body = readFile(path.join(__dirname, '..', 'assets',
    'index.html'), 'utf8')
  res.send(await body)
})

app.get('/', async (req, res) => {
  let file = path.join(__dirname, '..', 'assets', 'ui.pug')
  res.render(file)
})

app.get('/about', (req, res) => {
  let file = path.join(__dirname, '..', 'assets', 'about.pug')
  res.render(file)
})

app.get('/examples', (req, res) => {
  let file = path.join(__dirname, '..', 'assets', 'examples.pug')
  res.render(file)
})

app.get('/resource', async (req, res) => {
  let file = path.join(__dirname, '..', 'assets', 'resource.pug')
  res.render(file, { id: req.query.id || -1 })
})

app.get('/product', async (req, res) => {
  let file = path.join(__dirname, '..', 'assets', 'product.pug')
  res.render(file, { id: req.query.id || -1 })
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
