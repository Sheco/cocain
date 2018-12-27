'use strict'

/**
 * Process an object containing a list of resources, along with the recipe
 * describing how much of each resource is used.
 *
 * @class
 */
class Calculator {
  /**
   * Prepare the data
   *
   * @constructor
   * @param {object} data - An object literal containing the data
   */
  constructor (data) {
    // make a hard copy of the data object,
    // to avoid modifying it directly
    this.data = { ...data }
  }

  /**
   * Find the first resource with a given name, only if it has contents left
   *
   * @param {string} name - The name of the resource
   * @param {Number} amount - The amount of resources needed
   */
  findResource (name, amount) {
    for (let resource of this.data.resources) {
      if (resource.name === name &&
        (resource.left === undefined || resource.left)) {
        return resource
      }
    }
  }

  /**
   * Consume a certain amount of resources of a given name
   *
   * @param {string} name - The name of the resource
   * @param {Number} amount - The amount of resources needed
   */
  consume (name, amount) {
    let totalUsed = 0

    // loop while we still haven't satisfied the amount required
    while (amount > 0) {
      let resource = this.findResource(name, amount)

      if (resource === undefined) {
        throw Error(`Not enough ${name}`)
      }

      // unlimited resource, just consume it.
      if (resource.left === undefined) {
        resource.consumed += amount
        return amount
      }

      // consume as much as possible
      let consumed = Math.min(amount, resource.left)

      totalUsed += consumed
      amount -= consumed
      resource.consumed += consumed
      resource.left -= consumed
    }

    return totalUsed
  }

  /**
   * Runs through an array of components and consume each one of them
   *
   * @param {Object[]} components - The list of components to consume
   * @param {number} total - The total amount of products to aim for
   */
  consumeGroup (components, total) {
    if (!components) return

    for (let component of components) {
      let consumed = this.consume(component.resource,
        component.amount * total)

      component.consumed = consumed
    }
  }

  /**
   * Make sure everything is properly setup
   */
  setup () {
    for (let resource of this.data.resources) {
      resource.capacity = Number(resource.capacity) || 1
      resource.cost = Number(resource.cost)
      resource.amount = Number(resource.amount)
      resource.consumed = 0

      if (!resource.amount) {
        resource.amount = undefined
        resource.left = undefined
      } else {
        resource.left = resource.amount * resource.capacity
      }
    }

    for (let product of this.data.products) {
      if (product.setup === undefined) product.setup = []
      for (let component of product.setup) {
        component.amount = Number(component.amount)
      }

      if (product.recipe === undefined) product.recipe = []
      for (let component of product.recipe) {
        component.amount = Number(component.amount)
      }

      product.info.amount = Number(product.info.amount)

      if (!product.info.amount) {
        product.info.amount = this.maxProducts(product)
      }
    }
  }

  /**
   * Calculate the maximum amount of products that can be made
   * given the allocated resources
   */
  maxProducts (product) {
    // build an array of the max amount of resources per name
    let resources = {}
    for (let resource of this.data.resources) {
      if (!resource.left) continue

      resources[resource.name] = (resources[resource.name] || 0) +
        resource.left
    }

    // substract the components used when setting up first
    for (let component of product.setup) {
      if (!resources.left) continue
      resources[component.resource] -= component.amount
    }

    // divide the left over resource by the amount it needs per product
    let max
    for (let component of product.recipe) {
      if (resources[component.resource] === undefined) continue

      let thisMax = Math.floor(resources[component.resource] /
        component.amount)

      if (max === undefined || thisMax < max) max = thisMax
    }

    return max
  }

  /**
   * Start using the recipe, consume as much as neeed
   */
  make (product) {
    this.consumeGroup(product.setup, 1)
    this.consumeGroup(product.recipe, product.info.amount)
  }

  /**
   * Process one resource to perform some calculations
   *
   * @param {Object} resource - The resource with the updated information
   * about how much of it has been used, after being consumed
   */
  calculate (resource) {
    let type = resource.type || 'standard'

    // the type must be alphanumeric (and it can have a dash)
    if (!/^[\w-]+$/.test(type)) {
      throw Error('Invalid resource type: ' + type)
    }

    let result = require('./types/' + type)(resource)

    if (result.left >= 0 && resource.capacity > 1) {
      result.wastePcnt = Math.round(result.left /
        (result.amount * resource.capacity) * 100)
    }

    result.totalUsed = result.left !== undefined
      ? result.left + result.consumed
      : result.consumed

    return result
  }

  flattenComponents (product, resources) {
    let result = []

    let flatComponents = {}
    for (let component of [...product.recipe, ...product.setup]) {
      if (flatComponents[component.resource] === undefined) {
        flatComponents[component.resource] = { ...component }
        continue
      }
      flatComponents[component.resource].amount += component.amount
      flatComponents[component.resource].consumed += component.consumed
    }

    flatComponents = Object.values(flatComponents)
    for (let component of flatComponents) {
      let resource = resources[component.resource]
      let usagePcnt = resource.consumed / resource.totalUsed
      let consumedEffective = Math.round(
        component.consumed / usagePcnt * 1e2) / 1e2

      result.push({
        resource: component.resource,
        amount: component.amount,
        consumed: component.consumed,
        consumedEffective: consumedEffective,
        cost: Math.round(resource.cost *
        (consumedEffective / resource.totalUsed) *
          1e2) / 1e2
      })
    }
    return result
  }

  /**
   * Handle everything, set things up, consume components and return the result
   */
  process () {
    this.setup()
    for (let product of this.data.products) this.make(product)
    let resources = {}

    for (let resource of this.data.resources) {
      resources[resource.name] = this.calculate(resource)
    }

    let products = []
    // calculate price per component
    for (let product of this.data.products) {
      let components = this.flattenComponents(product, resources)
      products.push({
        name: product.info.name,
        amount: product.info.amount,
        cost: Math.round(
          components.reduce((total, x) => total + x.cost, 0) * 1e2) / 1e2,
        components: components
      })
    }

    // flatten the resources object into an array
    resources = Object.values(resources)

    return {
      products: products,
      resources: resources.filter(resource => resource.consumed > 0)

    }
  }
}

module.exports = function (data) {
  let calculator = new Calculator(data)
  return calculator.process()
}
