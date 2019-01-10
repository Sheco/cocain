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
   */
  findResource (name) {
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
      let resource = this.findResource(name)

      if (resource === undefined) {
        // throw Error(`Not enough ${name}`)
        return totalUsed
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

  * stageComponents (product, stages) {
    for (let component of product.recipe) {
      if (stages.includes(component.stage)) {
        yield component
      }
    }
  }

  /**
   * Make sure everything is properly setup
   */
  setup () {
    for (let resource of this.data.resources) {
      resource.capacity = Number(resource.capacity) || 1
      resource.cost = Number(resource.cost)
      resource.amount = resource.realAmount = Number(resource.amount)
      
      resource.consumed = 0

      if (!resource.amount) {
        resource.amount = undefined
        resource.left = undefined
      } else {
        resource.left = resource.amount * resource.capacity
      }
    }

    for (let product of this.data.products) {
      if (product.recipe === undefined) product.recipe = []
      for (let component of product.recipe) {
        component.amount = Number(component.amount)
      }

      product.info.amount = Number(product.info.amount)
      product.info.realAmount = product.info.amount
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
    for (let component of this.stageComponents(product, ['setup'])) {
      if (!resources.left) continue
      resources[component.resource] -= component.amount
    }

    // divide the left over resource by the amount it needs per product
    let max
    for (let component of this.stageComponents(
      product, ['product', undefined])) {
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
  preProcess (product) {
    let maxProducts = this.maxProducts(product)
    if (maxProducts !== undefined &&
      (!product.info.amount || maxProducts < product.info.amount)) {
      product.info.realAmount = maxProducts
    }

    this.consumeGroup(this.stageComponents(product, ['setup']), 1)
    this.consumeGroup(this.stageComponents(product, ['product', undefined]),
      product.info.realAmount)
  }

  /**
   * Process one resource to perform some calculations
   *
   * @param {Object} resource - The resource with the updated information
   * about how much of it has been used, after being consumed
   */
  calculate (resource) {
    /* if the amount is undefined, we'll calculate the amount of containers
    * spent and the leftover waste */
    resource.realAmount = resource.amount === undefined
      ? Math.ceil(resource.consumed / resource.capacity)
      : resource.amount

    resource.left = (resource.realAmount * resource.capacity) - resource.consumed

    /* The cost is that of the amount of containers */
    resource.finalCost = Math.round(((resource.cost * resource.realAmount) || 0) * 1e2) / 1e2

    if (resource.left >= 0 && resource.capacity > 0 && resource.amount > 0) {
      resource.wastePcnt = Math.round(resource.left /
        (resource.amount * resource.capacity) * 100)
    } else {
      resource.wastePcnt = 0
    }

    resource.totalUsed = resource.capacity * resource.realAmount
  }

  postProcess (component) {
    // First, get the relevant resources, and sum them up
    let resource = this.data.resources
      .reduce((prev, curr) => {
        if (curr.name !== component.resource) {
          return prev
        }

        return {
          consumed: prev.consumed + curr.consumed,
          totalUsed: prev.totalUsed + curr.totalUsed,
          finalCost: prev.finalCost + curr.finalCost
        }
      }, { consumed: 0, totalUsed: 0, finalCost: 0 })

    // then do some final calculations
    let usagePcnt = resource.consumed / resource.totalUsed
    component.consumedEffective = Math.round(
      component.consumed / usagePcnt * 1e2) / 1e2
    component.cost = Math.round(resource.finalCost *
      (component.consumedEffective / resource.totalUsed) *
        1e2) / 1e2
  }

  /**
   * Handle everything, set things up, consume components and return the result
   */
  process () {
    this.setup()
    for (let product of this.data.products) {
      this.preProcess(product)
    }

    for (let resource of this.data.resources) {
      this.calculate(resource)
    }

    let sumCost = (total, x) => total + x.cost

    // calculate price per component
    for (let product of this.data.products) {
      for (let component of product.recipe) {
        this.postProcess(component)
      }

      product.info.cost = Math.round(
        product.recipe.reduce(sumCost, 0) *
      1e2) / 1e2
    }

    return this.data
  }
}

module.exports = function (data) {
  let calculator = new Calculator(data)
  return calculator.process()
}
