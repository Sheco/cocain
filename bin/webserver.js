const Koa = require('koa')
const Router = require('koa-router')
const mount = require('koa-mount')
const assets = require('koa-static')
const body = require('koa-body')
const fs = require('fs')
const util = require('util')
const path = require('path')

const calculator = require('../src/calculator')
const convertCsv = require('../src/convertCsv')

const app = new Koa()
const router = new Router()
const readFile = util.promisify(fs.readFile)

app
  .use(router.routes())
  .use(router.allowedMethods())
  .use(mount('/assets', assets(path.join(__dirname, '/../assets'))))
  .listen(process.env.PORT || 8000)

router.post('/api', body(), async (ctx, next) => {
  ctx.set({
    'Access-Control-Allow-Origin': '*'
  })

  try {
    ctx.body = calculator(JSON.parse(ctx.request.body.src))
  } catch (e) {
    ctx.body = { 'error': e.message }
  }

  await next()
})

router.post('/convertCsv', body({ multipart: true }), async (ctx, next) => {
  if (!ctx.request.files.csv) {
    ctx.body = ''
    await next()
    return
  }

  try {
    ctx.body = await new Promise((resolve, reject) => {
      fs.createReadStream(ctx.request.files.csv.path)
        .on('error', error => reject(error))
        .pipe(convertCsv())
        .on('json', json => resolve(JSON.stringify(json, null, 2)))
    })
  } catch (error) {
    ctx.body = { error: error }
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
