const recipe = require('./recipe');
const fs = require('fs');

fs.promises.readFile('db/stickers.json')
.then(data => {
    data = recipe(JSON.parse(data));
    console.log(data.resources);
    console.log(`Total cost: $${data.cost.toFixed(2)}`);
});
