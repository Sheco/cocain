const Koa = require('koa')
const Router = require('koa-router')
const mount = require('koa-mount')
const assets = require('koa-static')
const body = require('koa-body')
const fs = require('fs')
const util = require('util')
const path = require('path')
const csv = require('csv-parse')

const calculator = require('../src/calculator')
const TransformCsv = require('../src/TransformCsv')

const app = new Koa()
const router = new Router()
const readFile = util.promisify(fs.readFile)
const stat = util.promisify(fs.stat)

app
  .use(router.routes())
  .use(router.allowedMethods())
  .use(mount('/assets', assets(path.join(__dirname, '/../assets'))))

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

    let csvStats = await stat(ctx.request.files.csv.path)
    if (csvStats.size > 10 * 1024) {
      throw Error(`CSV is too large, ${csvStats.size}>10KB`)
    }

    ctx.body = await new Promise(async (resolve, reject) => {
      fs.createReadStream(ctx.request.files.csv.path)
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

  ctx.body = await readFile(path.join(__dirname, '/../assets/index.html'))

  await next()
})

module.exports = app
