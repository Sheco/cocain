const Koa = require('koa')
const Router = require('koa-router')
const mount = require('koa-mount')
const assets = require('koa-static')
const body = require('koa-body')
const fs = require('fs')
const util = require('util')

const calculator = require('../src/calculator')
const convertCsv = require('../src/convertCsv')

const app = new Koa()
const router = new Router()
const readFile = util.promisify(fs.readFile)

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

  const stream = fs.createReadStream(ctx.request.files.csv.path)
  let json = await convertCsv(stream)
  ctx.body = JSON.stringify(json, null, 2)

  await next()
})

router.get('/', async (ctx, next) => {
  ctx.set({
    'Content-Type': 'text/html'
  })

  ctx.body = await readFile('assets/index.html')

  await next()
})

app
  .use(router.routes())
  .use(router.allowedMethods())
  .use(mount('/assets', assets('assets')))
  .listen(process.env.PORT || 8000)
