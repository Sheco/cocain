const parse = require('csv-parse')
const through2 = require('through2')

// This function converts a readStream containing a specific
// cvs layout into a valid JSON object usable in this project
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
module.exports = function () {
  // initialize the default empty object
  let data = {
    name: '',
    amount: undefined,
    resources: [],
    setup: [],
    product: []
  }

  let meta

  const convertLine = function (record) {
    // if the first record is not empty, get the column definitions
    // filter out any columns without a value
    if (record[0] !== '') {
      meta = {
        record: record.shift(),
        columns: record.filter(x => x)
      }
      return
    }

    // Ignore data if we haven't seen a definition row
    if (meta === undefined) return

    // remove the first column, which is empty
    record.shift()

    // if the first column was empty, the data is on the
    // other columns, using the previously defined definitions
    let recordData = {}
    record.forEach((value, index) => {
      if (!meta.columns[index]) return
      recordData[meta.columns[index]] = value
    })

    // if there is a property matching the meta record name,
    // then assume it's an array and push the data into it
    if (data[meta.record]) {
      data[meta.record].push(recordData)
      return
    }

    // otherwise, write the data properties to the root of the return object
    for (let [key, value] of Object.entries(recordData)) {
      data[key] = value
    }
  }

  return parse({ relax_column_count: true })
    .on('data', line => convertLine(line))
    .on('end', function () {
      this.emit('json', data)
    })
}
