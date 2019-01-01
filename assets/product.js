/* eslint-env browser */

let fields = {
  name: document.querySelector('input[name=name]'),
  amount: document.querySelector('input[name=amount]'),
  markup: document.querySelector('input[name=markup]')
}

let id
let product
let componentTemplate

function setup (x, addComponentButton) {
  let data = sessionStorage.getObj('data')
  id = x
  product = data.products[id] || {
    info: { name: '', amount: '' },
    recipe: []
  }

  componentTemplate = document.getElementById('componentTemplate')
    .cloneNode(true)
  let resourceSelect = componentTemplate.querySelector('[data-value=resource]')
  for (let resource of data.resources.map(x => x.name)) {
    let option = document.createElement('option')
    option.setAttribute('value', resource)
    option.textContent = resource

    resourceSelect.append(option)
  }

  document.getElementById('componentTemplate').remove()

  for (let component of product.recipe) {
    addComponent(component)
  }

  document.getElementById('addComponent').onclick = () => {
    addComponent({})
  }

  edit('save', 'close').then(() => {
    window.location.href = '/'
  })
}

function addComponent (data) {
  _.defaults(data, {
    stage: 'product',
    amount: ''
  })

  let newComponent = componentTemplate.cloneNode(true)
  newComponent.querySelector('.close').onclick = () => {
    newComponent.remove()
  }
  for (let element of newComponent.querySelectorAll('[data-value]')) {
    let field = element.getAttribute('data-value')
    element.value = data[field]
  }

  document.getElementById('data').appendChild(newComponent)
}

function fillInfo (info) {
  _.defaults(info, {
    name: '',
    amount: ''
  })

  fields.name.value = info.name
  fields.amount.value = info.amount
  fields.markup.value = info.markup
}

function editPromise (save, close) {
  return new Promise((resolve, reject) => {
    document.getElementById(save).onclick = function (e) {
      resolve({
        info: {
          name: fields.name.value,
          amount: fields.amount.value,
          markup: fields.markup.value
        },
        recipe: Array.from(document.querySelectorAll('.component')).map(dom => {
          return {
            'stage': dom.querySelector('select[name=stage]').value,
            'resource': dom.querySelector('select[name=resource]').value,
            'amount': dom.querySelector('input[name=amount]').value
          }
        })
      })
      document.getElementById(close).click()
    }
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
