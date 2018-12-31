/* eslint-env jquery, browser */

let fields = {
  name: $('input[name=name]'),
  amount: $('input[name=amount]')
}

let id
let product
let componentTemplate

function setup (x, addComponentButton) {
  let data = sessionStorage.getObj('data')
  id = x
  product = data.products[id] || {
    info: {},
    recipe: []
  }

  componentTemplate = $('#componentTemplate').clone()
  $('#componentTemplate').remove()

  for (let component of product.recipe) {
    addComponent(component)
  }

  $('#addComponent').on('click', () => {
    addComponent({ stage: 'product' })
  })

  edit('#save', '#close').then(() => {
    window.location.href = '/'
  })
}

function addComponent (data) {
  let newComponent = componentTemplate.clone()
  newComponent.find('.close').on('click', () => {
    newComponent.remove()
  })
  newComponent.find('[data-value]').each((id, element) => {
    element = $(element)
    let field = element.attr('data-value')
    element.val(data[field])
  })
  $('#data').append(newComponent)
}

function fillInfo (info) {
  info = info || {}

  fields.name.val(info.name)
  fields.amount.val(info.amount)
}

function editPromise (save, close) {
  return new Promise((resolve, reject) => {
    $(save).on('click', function (e) {
      resolve({
        info: {
          name: fields.name.val(),
          amount: fields.amount.val()
        },
        recipe: Array.from($('.component').map((id, dom) => {
          dom = $(dom)
          return {
            'stage': dom.find('select[name=stage]').val(),
            'resource': dom.find('input[name=resource]').val(),
            'amount': dom.find('input[name=amount]').val()
          }
        }))
      })
      $(close).click()
    })
  })
}

function edit (save, close) {
  fillInfo(product.info)

  return editPromise(save, close)
    .then(newData => {
      let data = sessionStorage.getObj('data')
      if (id === -1) {
        data.products.push(newData)
      } else {
        data.products[id] = newData
      }
      sessionStorage.setObj('data', data)
    })
}

