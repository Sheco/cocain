'use strict'

/* Gas
 *
 * mandatory variables:
 * cost: cost per unit (liter/galon)
 * mileage: vehicle's mileage
 *
 * optional variables:
 * amount: the maximum amount of gas available
 */
module.exports = function (resource) {
  if (resource.amount === undefined) {
    resource.realAmount = resource.consumed
  }

  resource.finalCost = Math.round((resource.cost / resource.mileage) *
    resource.realAmount * 1e2) / 1e2
}
