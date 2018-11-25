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

      if (resource.amount === undefined || resource.amount >= amount) {
        return resource
      }
    }
  }

  const consume = function (name, amount) {
    let c = findResource(name, amount)

    if (c === undefined) {
      throw (Error(`Not enough ${name}`))
    }

    if (c.amount !== undefined) {
      c.amount -= amount
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

  const make = function () {
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
        ret.message = 'Ran out of resources: ' + e
      }
      return ret
    }
  }

  const loadType = function (type) {
    // the type must be alphanumeric (and it can have a dash)
    if (type === undefined || !/^[\w-]+$/.test(type)) {
      throw (Error('Invalid resource type: ' + type))
    }

    return require('./types/' + type)
  }

  const calculateCost = function (resource) {
    let src = loadType(resource.type)
    resource.cost = (Math.round((src.fixedCost(resource) +
      (src.unitCost(resource) * resource.consumed)) * 100) / 100) || 0
  }

  const process = function () {
    let result = make()

    let resources = []
    for (let resource of data.resources) {
      let src = loadType(resource.type)
      calculateCost(resource)

      resources.push({
        type: resource.type,
        name: resource.name,
        cost: resource.cost,
        waste: resource.amount,
        consumed: resource.consumed,
        unit: src.unit
      })
    }
    result.totalCost = Math.round(resources
      .reduce((total, res) => total + res.cost, 0) * 100) / 100
    result.costPerProduct = Math.round(result.totalCost /
        result.products * 100) / 100
    result.resources = resources
    return result
  }

  return process()
}
