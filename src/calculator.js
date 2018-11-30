class Calculator {
  constructor (data) {
    // make a hard copy of the data object,
    // to avoid modifying it directly
    this.data = { ...data }
  }

  // find the first resource with a given name, only if it has contents left
  findResource (name, amount) {
    for (let resource of this.data.resources) {
      if (resource.name !== name) {
        continue
      }

      if (resource.left === undefined || resource.left) {
        return resource
      }
    }
  }

  // consume a certain amount of resources of a given name
  consume (name, amount) {
    // loop while we still haven't satisfied the amount required
    while (amount > 0) {
      let resource = this.findResource(name, amount)

      if (resource === undefined) {
        throw Error(`Not enough ${name}`)
      }

      // unlimited resource, just consume it.
      if (resource.left === undefined) {
        resource.consumed += amount
        return
      }

      // consume as much as possible
      let consumed = Math.min(amount, resource.left)

      amount -= consumed
      resource.consumed += consumed
      resource.left -= consumed
    }
  }

  consumeGroup (components, total) {
    if (!components) return

    for (let component of components) {
      this.consume(component.resource, component.amount * total)
    }
  }

  // run though the data and update some records where needed
  setup () {
    this.data.amount = parseInt(this.data.amount)
    for (let resource of this.data.resources) {
      resource.capacity = Number(resource.capacity)
      resource.cost = Number(resource.cost)
      resource.amount = Number(resource.amount)
      resource.consumed = 0

      if (!resource.amount) {
        resource.amount = undefined
        resource.left = undefined
      } else {
        resource.left = resource.amount * (resource.capacity || 1)
      }
    }

    for (let component of this.data.setup || []) {
      component.amount = Number(component.amount)
    }
    for (let component of this.data.product) {
      component.amount = Number(component.amount)
    }

    if (!this.data.amount) this.data.amount = this.maxProducts
  }

  /* calculate the maximum amount of products that can be made
   * given the allocated resources */
  get maxProducts () {
    // build an array of the max amount of resources per name
    let resources = {}
    for (let resource of this.data.resources) {
      if (!resource.left) continue

      resources[resource.name] = (resources[resource.name] || 0) +
        resource.left
    }

    // substract the components using when setting up first
    for (let component of this.data.setup || []) {
      resources[component.resource] -= component.amount
    }

    // divide the left over resource by the amount it needs per product
    let max
    for (let component of this.data.product || []) {
      if (resources[component.resource] === undefined) continue

      let thisMax = Math.floor(resources[component.resource] /
        component.amount)

      if (max === undefined || thisMax < max) max = thisMax
    }

    return max
  }

  make () {
    this.consumeGroup(this.data.setup, 1)
    this.consumeGroup(this.data.product, this.data.amount)
  }

  calculate (resource) {
    let type = resource.type || 'standard'

    // the type must be alphanumeric (and it can have a dash)
    if (type === undefined || !/^[\w-]+$/.test(type)) {
      throw Error('Invalid resource type: ' + type)
    }

    require('./types/' + type)(resource)

    if (resource.left >= 0 && resource.capacity) {
      resource.wastePcnt = Math.round(resource.left / resource.capacity * 100)
    }
  }

  process () {
    this.setup()
    this.make()
    let resources = []

    for (let resource of this.data.resources) {
      this.calculate(resource)
      let r = {
        type: resource.type,
        name: resource.name,
        amount: resource.amount,
        cost: resource.cost,
        consumed: resource.consumed,
        left: resource.left,
        wastePcnt: resource.wastePcnt
      }

      resources.push(r)
    }

    let products = this.data.amount
    let cost = Math.round(resources
      .reduce((total, res) => total + res.cost, 0) * 1e2) / 1e2

    let costPerProduct = Math.round(cost / products * 1e2) / 1e2

    // to calculate the waste percentage, filter only those resources
    // that have a wastePcnt, then divide the sum of all of those
    // by the number of elements
    let wastePcnt = resources.filter(resource => resource.wastePcnt >= 0)
    wastePcnt = Math.round((wastePcnt.reduce(
      (total, x) => total + x.wastePcnt, 0) / wastePcnt.length
    ) * 100) / 100

    return {
      products: products,
      cost: cost,
      costPerProduct: costPerProduct,
      wastePcnt: wastePcnt,
      resources: resources
    }
  }
}

module.exports = function (data) {
  let calculator = new Calculator(data)
  return calculator.process()
}
