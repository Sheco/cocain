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
  let result = {
    name: resource.name,
    amount: resource.amount,
    cost: undefined,
    consumed: resource.consumed,
    left: resource.left
  }

  if (resource.amount === undefined) {
    result.amount = resource.consumed
  }

  if (result.left >= 0 && resource.capacity > 1) {
    result.wastePcnt = Math.round(result.left /
      (result.amount * resource.capacity) * 100)
  }

  result.cost = Math.round((resource.cost / resource.mileage) *
    result.amount * 1e2) / 1e2
  return result
}
