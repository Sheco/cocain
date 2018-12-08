#!/usr/bin/env node
'use strict'

const webserver = require('../src/expressApp')

webserver.listen(process.env.PORT || 8000)
