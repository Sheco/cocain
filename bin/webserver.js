const Koa = require('koa')
const Router = require('koa-router')
const mount = require('koa-mount')
const assets = require('koa-static')
const bodyparser = require('koa-bodyparser')
const body = require('koa-body')
const handlebars = require('handlebars')
const fs = require('fs')

const calculate = require('../src')
const convertCsv = require('../src/convertCsv')

const app = new Koa()
const router = new Router()

router.post('/api', bodyparser(), async (ctx, next) => {
  ctx.set({
    'Access-Control-Allow-Origin': '*'
  })
  try {
    ctx.body = calculate(JSON.parse(ctx.request.body.src))
  } catch (e) {
    ctx.body = { 'error': e.message }
  }
  await next()
})

router.post('/convertCsv', body({ multipart: true }), async (ctx, next) => {
  if (!ctx.request.files.csv) {
    ctx.body = ''
    return
  }
  const stream = fs.createReadStream(ctx.request.files.csv.path)
  let json = await convertCsv(stream)
  ctx.body = JSON.stringify(json, null, 2)
})

router.get('/', bodyparser(), async (ctx, next) => {
  let txt = (await fs.promises.readFile('templates/index.hbs')).toString()
  let template = handlebars.compile(txt)
  let src = ctx.request.body.src
  ctx.body = template({
    src: src
  })
  await next()
})

app
  .use(router.routes())
  .use(router.allowedMethods())
  .use(mount('/assets', assets('assets')))

app.listen(process.env.PORT || 8000)
