/* eslint-env browser,jquery */

let resourceRow = document.getElementById('resources')
let productRow = document.getElementById('products')

let resourceTemplate = document.getElementById('resourceTemplate')
  .cloneNode(true)
resourceTemplate.removeAttribute('id')

let productInfoTemplate = document.getElementById('productInfoTemplate')
  .cloneNode(true)
productInfoTemplate.removeAttribute('id')

let productComponentTemplate = document.getElementById('productComponentTemplate')
  .cloneNode(true)
productComponentTemplate.removeAttribute('id')

document.getElementById('resourceTemplate').remove()
document.getElementById('productInfoTemplate').remove()
document.getElementById('productComponentTemplate').remove()

async function reload () {
  let data = sessionStorage.getObj('data')
  data = await process(data)
  showResources(data)
  showProducts(data)
}

function deleteResource (id) {
  let sessionData = sessionStorage.getObj('data')
  sessionData.resources.splice(id, 1)
  sessionStorage.setObj('data', sessionData)
  reload()
}

function deleteProduct (id) {
  let sessionData = sessionStorage.getObj('data')
  sessionData.products.splice(id, 1)
  sessionStorage.setObj('data', sessionData)
  reload()
}

const formatters = {
  decimal: function (value) {
    return Number(value).toLocaleString('us', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    })
  },
  integer: function (value) {
    return Number(value).toLocaleString('us')
  },
  money: function (value) {
    return '$' + formatters.decimal(value)
  }
}

function showResources (data) {
  resourceRow.innerHTML = ''

  for (let [id, resource] of Object.entries(data.resources)) {
    let card = resourceTemplate.cloneNode(true)

    // maybe later I could show a waste progress bar
    // let wasted = 100 - resource.wastePcnt
    let consumed = resource.left === undefined
      ? 100
      : 100 - (resource.consumed / resource.totalUsed * 100)

    let progress = card.querySelector('[data-type=consumed]')
    progress.setAttribute('style', `width: ${consumed}%`)
    progress.setAttribute('aria-valuenow', consumed)

    for (let element of card.querySelectorAll('[data-value]')) {
      let field = element.getAttribute('data-value')
      let format = element.getAttribute('data-format')
      let value = format && formatters[format]
        ? formatters[format](resource[field])
        : resource[field]

      element.innerHTML = value
    }

    card.querySelector('button.close').onclick = (ev) => deleteResource(id)
    for (let element of card.querySelectorAll('[data-type=resourceURL]')) {
      element.setAttribute('href', '/resource?id=' + id)
    }

    resourceRow.appendChild(card)
  }
}

function showProducts (data) {
  productRow.innerHTML = ''

  for (let [id, product] of Object.entries(data.products)) {
    let row = document.createElement('div')
    row.setAttribute('class', 'row')

    // fill info block
    let template = productInfoTemplate.cloneNode(true)
    console.log(product)

    for (let element of template.querySelectorAll('[data-type=resourceURL]')) {
      element.setAttribute('href', '/product?id=' + id)
    }

    product.info.costPerProduct = product.info.cost / product.info.realAmount

    for (let element of template.querySelectorAll('[data-value]')) {
      let field = element.getAttribute('data-value')
      let format = element.getAttribute('data-format')
      let value = format && formatters[format]
        ? formatters[format](product.info[field])
        : product.info[field]
      element.innerHTML = value
    }
    template.querySelector('button.close').onclick = (ev) => deleteProduct(id)

    row.appendChild(template)

    // work on the components
    template = productComponentTemplate.cloneNode(true)
    for (let component of product.recipe) {
      let block = template.cloneNode(true)
      for (let element of block.querySelectorAll('[data-value]')) {
        let field = element.getAttribute('data-value')
        let format = element.getAttribute('data-format')
        let value = format && formatters[format]
          ? formatters[format](component[field])
          : component[field]

        element.innerHTML = value
      }
      row.appendChild(block)
    }

    productRow.appendChild(row)
  }
}

async function process (data) {
  return fetch('/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ src: JSON.stringify(data) })
  })
    .then(async response => {
      let json = await response.json()

      if (response.status !== 200) {
        throw Error(`/api returned ${response.status}: ${response.statusText}\n\n${json.error}`)
      }

      return json
    })
}

reload()
