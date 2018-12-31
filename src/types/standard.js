'use strict'

/* standard cost calculator
 *
 * Mandatory variables:
 * cost: if the object has a capacity, the cost is per container
 *   otherwise, the cost is per unit consumed
 *
 * Optional variables:
 * capacity: the capacity for each container of this resource
 * amount: if it has a capacity, amount is the amount of containers
 *   otherwise it is the amount of units available
 *   if the amount is undefined, it means it's infinite so it will
 *   use as many as it can
 * type: the type of resource (defaults to 'standard')
 */
module.exports = function (resource) {
  /* if the amount is undefined, we'll calculate the amount of containers
   * spent and the leftover waste */
  resource.realAmount = resource.amount === undefined
    ? Math.ceil(resource.consumed / resource.capacity)
    : resource.amount

  if (resource.capacity > 1 && resource.amount > 0) {
    resource.left = (resource.amount * resource.capacity) - resource.consumed
  }

  /* The cost is that of the amount of containers */
  resource.finalCost = Math.round(((resource.cost * resource.realAmount) || 0) * 1e2) / 1e2
}
