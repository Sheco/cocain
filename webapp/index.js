const koa = require('koa');
const router = require('koa-router');
const bodyparser = require('koa-bodyparser');
const handlebars = require('handlebars');
const fs = require('fs');

const calculate = require('../src');

const app = new koa();
const routes = new router();

routes.all('/', bodyparser(), async (ctx, next) => {
    let txt = (await fs.promises.readFile('webapp/index.hbs')).toString();
    let template = handlebars.compile(txt);

    let src = ctx.request.body.src;
    console.log(src);
    try {
        let result = calculate(JSON.parse(src));
        console.log(result);
        ctx.body = template({
            error: undefined,
            src: src,
            result: JSON.stringify(result)
        });
    } catch(e) {
        ctx.body = template({
            error: e,
            src: src,
            result: undefined
        });
    }
        

});

app
    .use(routes.routes())
    .use(routes.allowedMethods())


module.exports = app;
