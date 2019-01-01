/* eslint-env browser */

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

function updateValues (parent, data) {
  for (let element of parent.querySelectorAll('[data-value]')) {
    let field = element.getAttribute('data-value')
    let format = element.getAttribute('data-format')
    let value = format && formatters[format]
      ? formatters[format](data[field])
      : data[field]

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

    updateValues(template, product.info)
    template.querySelector('button.close').onclick = (ev) => deleteProduct(id)

    row.appendChild(template)

    // work on the components
    template = productComponentTemplate.cloneNode(true)
    for (let component of product.recipe) {
      let block = template.cloneNode(true)
      updateValues(block, component)
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
