// When making as many products as possible, don't let it run for too long
const timeLimit = 2000

module.exports = function (data) {
  // make a hard copy of the data object,
  // to avoid modifying it directly
  data = { ...data }

  const findResource = function (name, amount) {
    for (let resource of data.resources) {
      if (resource.name !== name) {
        continue
      }

      if (resource.waste === undefined ||
        resource.waste >= amount) {
        return resource
      }
    }
  }

  const consume = function (name, amount) {
    let c = findResource(name, amount)

    if (c === undefined) {
      throw (Error(`Not enough ${name}`))
    }

    if (c.waste !== undefined) {
      c.waste -= amount
    }

    c.consumed = (c.consumed || 0) + amount
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
        resource.waste = undefined
        continue
      }
      resource.waste = resource.amount * (resource.capacity || 1)
    }
  }

  const make = function () {
    setup()
    let components = data.components

    consumeGroup(components.general, 1)

    if (data.amount > 0) {
      return {
        products: consumeGroup(components.product, data.amount)
      }
    } else {
      let ret = {
        products: 0
      }
      let start = new Date().valueOf()

      try {
        while (true) {
          ret.products += consumeGroup(components.product, 1)

          let now = new Date().valueOf()
          if (now - start > timeLimit) {
            throw (Error(`It took longer than ${timeLimit}ms`))
          }
        }
      } catch (e) {
        ret.message = e.message
      }
      return ret
    }
  }

  const cost = function (resource) {
    let type = resource.type || 'standard'

    // the type must be alphanumeric (and it can have a dash)
    if (type === undefined || !/^[\w-]+$/.test(type)) {
      throw (Error('Invalid resource type: ' + type))
    }

    let result = require('./types/' + type)(resource)

    return Math.round(result * 100) / 100
  }

  const process = function () {
    let result = make()
    let resources = []

    for (let resource of data.resources) {
      let r = {
        type: resource.type,
        name: resource.name,
        amount: resource.amount,
        cost: cost(resource),
        consumed: resource.consumed
      }

      if (resource.waste >= 0) {
        r.waste = resource.waste
        r.wastePcnt = Math.round(resource.waste / resource.capacity * 100)
      }
      resources.push(r)
    }

    result.total = Math.round(resources
      .reduce((total, res) => total + res.cost, 0) * 100) / 100

    result.costPerProduct = Math.round(result.total /
        result.products * 100) / 100

    let wastePcnt = resources.filter(resource => resource.wastePcnt >= 0)
    result.wastePcnt = wastePcnt.reduce(
      (total, x) => total + x.wastePcnt, 0) /
      wastePcnt.length

    result.resources = resources

    return result
  }

  return process()
}
