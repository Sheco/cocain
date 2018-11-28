const parse = require('csv-parse')

function convert (stream, cb) {
  let data = {
    name: '',
    amount: undefined,
    resources: [],
    setup: [],
    product: []
  }
  let meta

  let parser = parse({
    relax_column_count: true
  }).on('readable', function () {
    let record
    while ((record = this.read())) {
      // if the first record is empty, we're getting data
      if (record[0] === '') {
        if (!meta) continue
        record.shift() // remove empty first column
        let recordData = {}
        record.forEach((value, index) => {
          if (!meta.columns[index]) return
          recordData[meta.columns[index]] = value
        })

        // if the record is invalid, we're currently silently ignoring it
        if (data[meta.record]) data[meta.record].push(recordData)
        continue
      }

      if (record[0] === 'info') {
        data.name = record[1]
        data.amount = record[2]
        continue
      }

      // otherwise we have a destination header
      meta = {
        record: record.shift(),
        columns: record.filter(x => x)
      }
    }
  }).on('end', function () {
    cb(null, data)
  }).on('error', function (error) {
    cb(error, null)
  })

  stream.pipe(parser)
}

module.exports = function (stream, cb) {
  if (!cb) {
    // if no callback given, promisify the return value
    return new Promise((resolve, reject) => {
      convert(stream, (err, data) => {
        if (err) reject(err)
        resolve(data)
      })
    })
  }

  // otherwise, call the convert function normally
  convert(stream, cb)
}
