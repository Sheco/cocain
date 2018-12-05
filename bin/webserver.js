const webserver = require('../src/webserver')

webserver.listen(process.env.PORT || 8000)
