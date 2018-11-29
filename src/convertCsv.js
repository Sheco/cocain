const parse = require('csv-parse')

// This function converts a readStream containing a specific
// cvs layout into a valid JSON object usable in this project
//
// the CSV has to have this layout:
//
// A line whose first column is "info" will extract and use:
//   the second column into data.name
//   the third column into data.amount
//
// A line whose first column is not empty will start the
// resource definition parsing, the columns next to it will
// indicate the property into which each column's values will
// written to
//
//   For example (padded to make it easier to read):
//   resources,name     ,capacity,amount,cost
//            ,chocolate,1000    ,10    ,30
//
//   This will add push a item into data.resources:
//      {
//        name: 'chocolate',
//        capacity: 1000,
//        amount: 10,
//        cost: 30
//      }
//
function convert (stream, cb) {
  // initialize the default empty object
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
      // if the first record is info, get the name and amount
      if (record[0] === 'info') {
        data.name = record[1]
        data.amount = record[2]
        continue
      }

      // if the first record is not empty, get the column definitions
      // filter out any columns without a value
      if (record[0] !== '') {
        meta = {
          record: record.shift(),
          columns: record.filter(x => x)
        }
        continue
      }

      if (meta === undefined) continue

      // remove the first column, which is empty
      record.shift()

      // if the first column was empty, the data is on the
      // other columns, using the previously defined definitions
      let recordData = {}
      record.forEach((value, index) => {
        if (!meta.columns[index]) return
        recordData[meta.columns[index]] = value
      })

      // if the record is invalid, we're currently silently ignoring it
      if (!data[meta.record]) continue

      data[meta.record].push(recordData)
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
      stream.on('error', err => reject(err))
      convert(stream, (err, data) => {
        if (err) reject(err)
        resolve(data)
      })
    })
  }

  // otherwise, call the convert function normally
  stream.on('error', err => cb(err, null))
  convert(stream, cb)
}
