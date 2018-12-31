/* eslint-env jquery, browser */

let fields = {
  name: $('input[name=name]'),
  cost: $('input[name=cost]'),
  capacity: $('input[name=capacity]'),
  amount: $('input[name=amount]')
}

function fill (data) {
  data = data || {}

  fields.name.val(data.name)
  fields.cost.val(data.cost)
  fields.capacity.val(data.capacity)
  fields.amount.val(data.amount)
}

function edit (save, close) {
  return new Promise((resolve, reject) => {
    $(save).on('click', function (e) {
      resolve({
        name: fields.name.val(),
        cost: fields.cost.val(),
        capacity: fields.capacity.val(),
        amount: fields.amount.val()
      })
      $(close).click()
    })
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
        data.resources[id] = newData
      }
      sessionStorage.setObj('data', data)
    })
}
