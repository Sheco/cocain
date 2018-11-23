const koa = require('koa');
const router = require('koa-router');
const bodyparser = require('koa-bodyparser');
const handlebars = require('handlebars');
const fs = require('fs');

const calculate = require('../src');

const app = new koa();
const routes = new router();

routes.post('/api', bodyparser(), async (ctx, next) => {
    try {
        ctx.body = calculate(JSON.parse(ctx.request.body.src));
    } catch(e) {
        ctx.body = {'error':e.toString()};
    }
    next();
});

routes.get('/', bodyparser(), async (ctx, next) => {
    let txt = (await fs.promises.readFile('webapp/index.hbs')).toString();
    let template = handlebars.compile(txt);
    let src = ctx.request.body.src;
    ctx.body = template({
        src: src,
    });
    next();

});

app
    .use(routes.routes())
    .use(routes.allowedMethods());

app.listen(process.env.PORT || 8000);
