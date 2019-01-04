/* eslint-env browser */

let resourceRow = document.getElementById('resources')
let productRow = document.getElementById('products')

let resourceTemplate = document.getElementById('resourceTemplate')
  .cloneNode(true)
resourceTemplate.removeAttribute('id')

let resourceAddTemplate = document.getElementById('resourceAddTemplate')
  .cloneNode(true)

let productInfoTemplate = document.getElementById('productInfoTemplate')
  .cloneNode(true)
productInfoTemplate.removeAttribute('id')

let productComponentTemplate = document.getElementById('productComponentTemplate')
  .cloneNode(true)
productComponentTemplate.removeAttribute('id')

let productAddTemplate = document.getElementById('productAddTemplate')

document.getElementById('resourceTemplate').remove()
document.getElementById('resourceAddTemplate').remove()
document.getElementById('productInfoTemplate').remove()
document.getElementById('productComponentTemplate').remove()
document.getElementById('productAddTemplate').remove()

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
  NaNisZero: function (value) {
    return isNaN(value) ? 0 : value
  },
  NaNisInfinite: function (value) {
    return isNaN(value) ? '∞' : value
  },
  decimal: function (value) {
    if (isNaN(value)) return value

    return Number(value).toLocaleString('us', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    })
  },
  integer: function (value) {
    if (isNaN(value)) return value

    return Number(value).toLocaleString('us')
  },
  money: function (value) {
    if (isNaN(value)) return value

    return '$' + formatters.decimal(value)
  },
  units: function (value, data) {
    return value + data.unit
  }
}

function updateValues (parent, data) {
  for (let element of parent.querySelectorAll('[data-value]')) {
    let field = element.getAttribute('data-value')
    let format = element.getAttribute('data-format')
    let value = data[field]

    if (format) {
      for (let f of format.split(',')) {
        if (formatters[f] !== undefined) {
          value = formatters[f](value, data)
        }
      }
    } else {
      value = data[field]
    }

    element.textContent = value
  }
}

function showResources (data) {
  resourceRow.innerHTML = ''

  for (let [id, resource] of Object.entries(data.resources)) {
    let card = resourceTemplate.cloneNode(true)

    let progress = card.querySelector('[data-type=consumed]')
    if (resource.left === undefined) {
      progress.classList.add('progress-bar-striped')
      progress.classList.add('progress-bar-animated')
    } else {
      let consumed = 100 - (resource.consumed / resource.totalUsed * 100)
      progress.setAttribute('style', `width: ${consumed}%`)
      progress.setAttribute('aria-valuenow', consumed)
    }

    resource.totalCapacity = resource.capacity * resource.amount

    updateValues(card, resource)

    card.querySelector('button.close').onclick = (ev) => deleteResource(id)
    for (let element of card.querySelectorAll('[data-type=resourceURL]')) {
      element.setAttribute('href', '/resource?id=' + id)
    }

    resourceRow.appendChild(card)
  }

  resourceRow.appendChild(resourceAddTemplate)
}

function showProducts (data) {
  productRow.innerHTML = ''

  for (let [id, product] of Object.entries(data.products)) {
    let row = document.createElement('div')
    row.classList.add('row')
    row.classList.add('mb-3')

    // fill info block
    let template = productInfoTemplate.cloneNode(true)

    for (let element of template.querySelectorAll('[data-type=resourceURL]')) {
      element.setAttribute('href', '/product?id=' + id)
    }

    product.info.costPerProduct = product.info.cost / product.info.realAmount
    product.info.pricePerProduct = product.info.costPerProduct * product.info.markup

    updateValues(template, product.info)
    template.querySelector('button.close').onclick = (ev) => deleteProduct(id)

    row.appendChild(template)

    // work on the components
    template = productComponentTemplate.cloneNode(true)
    for (let component of product.recipe) {
      let block = template.cloneNode(true)
      component.unit = data.resources
        .filter(x => x.name === component.resource)
        .reduce((acc, curr) => curr.unit, '')
      updateValues(block, component)
      row.appendChild(block)
    }

    productRow.appendChild(row)
  }
  productRow.appendChild(productAddTemplate)
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
