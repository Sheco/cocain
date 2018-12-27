'use strict'

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
/**
 * Stream Transformer, which parses a stream of objects, where each object
 * is an array of fields
 *
 * @class
 */
class TransformCsv extends Transform {
  /**
   * Initialize
   *
   * @constructor
   * @param {Object} options - Options to be sent to the Transform super()
   */
  constructor (options) {
    if (options === undefined) options = {}
    options.objectMode = true

    super(options)
    this.data = {
      products: [],
      resources: []
    }

    this.meta = undefined
    this.product = undefined
  }

  setupMeta (record) {
    this.meta = {
      property: record.shift(),
      columns: record.filter(x => x)
    }
  }

  // This method prepares the internal parsing...  there's a local save()
  // function which saves the data in the appropiate array
  //
  // It saves internal variables which serve as the working state which is
  // preserved for every line of the csv
  //
  // Each time an 'info' row is received, it creates a new empty product
  // and adds it to the list of products. Each following row (until a new
  // 'info' row) will save their info into the last product in the stack
  //
  // The 'resources' row is handled separately, the following rows will append
  // their data to the resources array
  setupBlock () {
    try {
      if (this.meta.property === 'resources') {
        console.error('resources')
        this.save = (data) => {
          this.data.resources.push(data)
        }
      } else if (this.meta.property === 'info') {
        console.error('info')
        this.product = {
          info: {},
          recipe: [],
          setup: []
        }
        this.data.products.push(this.product)
        this.save = (data) => {
          this.product.info = data
        }
      } else {
        this.save = (data) => {
          this.product[this.meta.property].push(data)
        }
      }
    } catch (err) {
      // something bad happened, it's most likely because the csv is invalid.
      // though luck, we don't care
      console.error(err.message())
    }
  }

  parse (record) {
    // remove the first column, which is empty
    record.shift()

    let recordData = {}

    record.forEach((value, index) => {
      if (!this.meta.columns[index]) return
      recordData[this.meta.columns[index]] = value.trim()
    })

    // only append items to the array if they are not empty
    if (Object.keys(recordData).length > 0) {
      this.save(recordData)
    }
  }
  /**
   * Process a line of input, parse the records and start building up the
   * result
   *
   * @param {Object} record - An array of strings
   */
  processLine (record) {
    // if the first record is not empty, get the column definitions
    // filter out any columns without a value
    if (record[0] !== '') {
      this.setupMeta(record)
      this.setupBlock()
      return
    }

    // Ignore data if we haven't seen a definition row
    if (this.meta === undefined) return

    this.parse(record)
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

/**
 * Return a simple promise to parse a CSV file
 *
 * @param {stream} stream - Stream where we'll get the data
 * @return {Promise}
 */
module.exports.csv = async function (stream) {
  const csv = require('csv-parse')
  return new Promise((resolve, reject) => {
    stream
      .on('error', reject)
      .pipe(csv({ relax_column_count: true }))
      .on('error', reject)
      .pipe(new TransformCsv())
      .on('data', resolve)
      .on('error', reject)
  })
}
