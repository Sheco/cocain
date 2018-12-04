const { Transform } = require('stream')

// TransformCsv is a Transform stream, it receives a stream
// of objects, processes each record and stores it in a separate
// destination array, which is then stringified at the end
// and fed to the stream output
//
// It is currently used when piped after something like this:
//
// let stream = ... // something something
// const parse = require('csv-parse')
// stream.pipe(parse({ relax_column_count: true}))
//   .pipe(new TransformCsv())
//
// the CSV has to have this layout:
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
//   This will push an item into data.resources:
//      {
//        name: 'chocolate',
//        capacity: 1000,
//        amount: 10,
//        cost: 30
//      }
//
//  The valid root property names are resources, setup and product
//
//  If the first column is anything other than that, each of the values
//  will be saved to the root of the data object
//
// TODO this might not work well if the input CSV is too large and
// and flush() is called more than once, although I am not sure about that
// we might need to test that.

class TransformCsv extends Transform {
  constructor (options) {
    if (options === undefined) options = {}
    options.objectMode = true

    super(options)
    this.data = {
      name: '',
      amount: undefined,
      resources: [],
      setup: [],
      product: []
    }

    this.meta = undefined
  }

  processLine (record) {
    // if the first record is not empty, get the column definitions
    // filter out any columns without a value
    if (record[0] !== '') {
      this.meta = {
        record: record.shift(),
        columns: record.filter(x => x)
      }
      return
    }

    let meta = this.meta
    let data = this.data

    // Ignore data if we haven't seen a definition row
    if (meta === undefined) return

    // remove the first column, which is empty
    record.shift()

    // if there is a property matching the meta record name,
    // then assume it's an array and push the data into it
    // otherwise just assign the values into the object itself
    let recordData = data
    if (data[meta.record]) {
      recordData = {}
      data[meta.record].push(recordData)
    }

    record.forEach((value, index) => {
      if (!meta.columns[index]) return
      recordData[meta.columns[index]] = value
    })
  }

  _transform (data, enc, next) {
    this.processLine(data)
    next()
  }

  _flush (done) {
    done(null, JSON.stringify(this.data))
  }
}

module.exports = TransformCsv
