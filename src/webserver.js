const Koa = require('koa')
const Router = require('koa-router')
const mount = require('koa-mount')
const assets = require('koa-static')
const body = require('koa-body')
const fs = require('fs')
const util = require('util')
const path = require('path')
const csv = require('csv-parse')
const StreamConcat = require('stream-concat')

const calculator = require('../src/calculator')
const TransformCsv = require('../src/TransformCsv')

const app = new Koa()
const router = new Router()
const readFile = util.promisify(fs.readFile)
const stat = util.promisify(fs.stat)

app
  .use(router.routes())
  .use(router.allowedMethods())
  .use(mount('/assets', assets(path.join(__dirname, '..', 'assets'))))

router.post('/api', body(), async (ctx, next) => {
  ctx.set({
    'Access-Control-Allow-Origin': '*'
  })

  try {
    ctx.body = calculator(JSON.parse(ctx.request.body.src))
  } catch (e) {
    ctx.throw(400, JSON.stringify({ error: e.message }))
  }

  await next()
})

router.post('/convertCsv', body({ multipart: true }), async (ctx, next) => {
  try {
    if (!ctx.request.files.csv) throw Error('No file specified')

    // if there is only a single file, convert that into an array of 1 element
    let files = ctx.request.files.csv.length
      ? ctx.request.files.csv
      : [ ctx.request.files.csv ]

    for (let file of files) {
      let csvStats = await stat(file.path)
      if (csvStats.size > 10 * 1024) {
        throw Error(`${file.name} is too large, ${csvStats.size}>10KB`)
      }
    }

    ctx.body = await new Promise(async (resolve, reject) => {
      new StreamConcat(files.map(file => fs.createReadStream(file.path)))
        .on('error', error => reject(error))
        .pipe(csv({ relax_column_count: true }))
        .pipe(new TransformCsv())
        .on('data', data => {
          let json = JSON.parse(data)
          resolve(JSON.stringify(json, null, 2))
        })
    })
  } catch (error) {
    ctx.throw(400, error.message)
  }

  await next()
})

router.get('/', async (ctx, next) => {
  ctx.set({
    'Content-Type': 'text/html'
  })

  ctx.body = await readFile(path.join(__dirname, '..', 'assets', 'index.html'))

  await next()
})

module.exports = app
