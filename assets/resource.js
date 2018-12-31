/* eslint-env jquery, browser */

let fields = {
  name: document.querySelector('input[name=name]'),
  cost: document.querySelector('input[name=cost]'),
  capacity: document.querySelector('input[name=capacity]'),
  amount: document.querySelector('input[name=amount]')
}

function fill (data) {
  data = data || {
    name: '',
    capacity: '',
    amount: '',
    cost: ''
  }

  fields.name.value = data.name
  fields.cost.value = data.cost
  fields.capacity.value = data.capacity
  fields.amount.value = data.amount
}

function edit (save, close) {
  return new Promise((resolve, reject) => {
    document.getElementById(save).onclick = function (e) {
      resolve({
        name: fields.name.value,
        cost: fields.cost.value,
        capacity: fields.capacity.value,
        amount: fields.amount.value
      })
      document.getElementById(close).click()
    }
  })
}

function sessionEdit (id, save, close) {
  let data = sessionStorage.getObj('data')
  fill(data.resources[id])

  return edit(save, close)
    .then(newData => {
      if (id === -1) {
        data.resources.push(newData)
      } else {
        // if the name was changed, update the products' components
        if (newData.name !== data.resources[id].name) {
          for (let product of data.products) {
            for (let component of product.recipe) {
              if (component.resource !== data.resources[id].name) {
                continue
              }
              component.resource = newData.name
            }
          }
        }

        data.resources[id] = newData
      }
      sessionStorage.setObj('data', data)
    })
}
