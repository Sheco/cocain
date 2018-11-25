const Koa = require('koa')
const Router = require('koa-router')
const bodyparser = require('koa-bodyparser')
const handlebars = require('handlebars')
const fs = require('fs')

const calculate = require('../src')

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

router.get('/', bodyparser(), async (ctx, next) => {
  let txt = (await fs.promises.readFile('webapp/index.hbs')).toString()
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

app.listen(process.env.PORT || 8000)
