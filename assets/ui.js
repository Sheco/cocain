/* eslint-env browser,jquery */

let resourceRow = $('#resources')
let productRow = $('#products')

let resourceTemplate = $('#resourceTemplate').clone()
let productInfoTemplate = $('#productInfoTemplate').clone()
let productComponentTemplate = $('#productComponentTemplate').clone()

$('#resourceTemplate').remove()
$('#productInfoTemplate').remove()
$('#productComponentTemplate').remove()

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

function showResources (data) {
  resourceRow.empty()

  for (let [id, resource] of Object.entries(data.resources)) {
    let card = resourceTemplate.clone()

    // maybe later I could show a waste progress bar
    // let wasted = 100 - resource.wastePcnt
    let consumed = resource.left === undefined
      ? 100
      : 100 - (resource.consumed / resource.totalUsed * 100)

    let progress = card.find('[data-type=consumed]')
    progress.attr('style', `width: ${consumed}%`)
    progress.attr('aria-valuenow', consumed)

    card.find('[data-value]').each((_, element) => {
      element = $(element)
      let field = element.attr('data-value')
      element.html(resource[field])
    })
    card.find('button.close').on('click', (ev) => deleteResource(id))
    card.find('[data-type=resourceURL]').each((_, element) => {
      element = $(element)
      element.attr('href', '/resource?id=' + id)
    })

    resourceRow.append(card)
  }
}

function showProducts (data) {
  productRow.empty()

  for (let [id, product] of Object.entries(data.products)) {
    let row = $('<div class="row">')

    // fill info block
    let template = productInfoTemplate.clone()

    template.find('[data-type=resourceURL]').each((_, element) => {
      element = $(element)
      element.attr('href', '/product?id=' + id)
    })
    template.find('[data-value]').each((_, element) => {
      element = $(element)
      let field = element.attr('data-value')
      element.html(product.info[field])
    })
    template.find('button.close').on('click', (ev) => deleteProduct(id))

    row.append(template)

    // work on the components
    template = productComponentTemplate.clone()
    for (let component of product.recipe) {
      let block = template.clone()
      block.find('[data-value]').each((_, element) => {
        element = $(element)
        let field = element.attr('data-value')
        element.html(component[field])
      })
      row.append(block)
    }

    productRow.append(row)
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
