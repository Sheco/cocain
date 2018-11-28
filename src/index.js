module.exports = function (data) {
  // make a hard copy of the data object,
  // to avoid modifying it directly
  data = { ...data }

  const findResource = function (name, amount) {
    for (let resource of data.resources) {
      if (resource.name !== name) {
        continue
      }

      if (resource.left === undefined || resource.left) {
        return resource
      }
    }
  }

  const consume = function (name, amount) {
    // loop while we still haven't satisfied the amount required
    while (amount > 0) {
      let c = findResource(name, amount)

      if (c === undefined) {
        throw (Error(`Not enough ${name}`))
      }

      if (c.left === undefined) {
        // unlimited resource, just consume it.
        c.consumed = (c.consumed || 0) + amount
        return
      }

      let consumed
      if (amount > c.left) {
        // consume everything it has left
        consumed = c.left

        amount -= c.left
        c.left = 0
      } else {
        // we'll have some resources left
        consumed = amount

        c.left -= amount
        amount = 0
      }
      c.consumed = (c.consumed || 0) + consumed
    }
  }

  const consumeGroup = function (components, total) {
    if (!components) {
      return 0
    }

    for (let component of components) {
      consume(component.resource, component.amount * total)
    }

    return total
  }

  const setup = function () {
    for (let resource of data.resources) {
      if (resource.amount === undefined) {
        resource.left = undefined
        continue
      }
      resource.left = resource.amount * (resource.capacity || 1)
    }
  }

  /* calculate the maximum amount of products that can be made
   * given the allocated resources */
  const maxProducts = function () {
    // build an array of the max amount of resources per name
    let resources = {}
    for (let resource of data.resources) {
      if (!resource.left) continue

      resources[resource.name] = (resources[resource.name] || 0) +
        resource.left
    }

    // substract the general components
    for (let component of data.components.general || []) {
      resources[component.resource] -= component.amount
    }

    // divide the left over resource by the amount it needs per product
    let max
    for (let component of data.components.product || []) {
      if (resources[component.resource] === undefined) continue

      let thisMax = Math.floor(resources[component.resource] /
        component.amount)

      if (max === undefined || thisMax < max) max = thisMax
    }

    return max
  }

  const make = function () {
    setup()
    if (!data.amount) data.amount = maxProducts()

    consumeGroup(data.components.general, 1)
    consumeGroup(data.components.product, data.amount)
  }

  const calculate = function (resource) {
    let type = resource.type || 'standard'

    // the type must be alphanumeric (and it can have a dash)
    if (type === undefined || !/^[\w-]+$/.test(type)) {
      throw (Error('Invalid resource type: ' + type))
    }

    let result = require('./types/' + type)(resource)

    return Math.round(result * 1e2) / 1e2
  }

  const process = function () {
    make()
    let resources = []

    for (let resource of data.resources) {
      calculate(resource)
      let r = {
        type: resource.type,
        name: resource.name,
        amount: resource.amount,
        cost: resource.cost,
        consumed: resource.consumed
      }

      if (resource.left >= 0 && resource.capacity) {
        r.left = resource.left
        r.wastePcnt = Math.round(resource.left / resource.capacity * 100)
      }
      resources.push(r)
    }

    let products = data.amount
    let total = Math.round(resources
      .reduce((total, res) => total + res.cost, 0) * 1e2) / 1e2

    let costPerProduct = Math.round(total / products * 1e2) / 1e2

    // to calculate the waste percentage, filter only those resources
    // that have a wastePcnt, then divide the sum of all of those
    // by the number of elements
    let wastePcnt = resources.filter(resource => resource.wastePcnt >= 0)
    wastePcnt = Math.round((wastePcnt.reduce(
      (total, x) => total + x.wastePcnt, 0) / wastePcnt.length
    ) * 100) / 100

    return {
      products: products,
      total: total,
      costPerProduct: costPerProduct,
      wastePcnt: wastePcnt,
      resources: resources
    }
  }

  return process()
}
