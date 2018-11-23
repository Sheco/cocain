const recipe = require('./recipe');
const fs = require('fs');

fs.promises.readFile('db/stickers.json')
.then(data => {
    let r = recipe(JSON.parse(data));
    console.log(r);
    console.log(`Total cost: $${r.cost.toFixed(2)}`);
});
