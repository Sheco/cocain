/* Gas
 *
 * mandatory variables:
 * cost: cost per unit (liter/galon)
 * mileage: vehicle's mileage
 *
 * optional variables:
 * amount: the maximum amount of gas available
 */
module.exports = function (vars) {
  if (vars.amount === undefined) {
    vars.amount = vars.consumed
  }

  if (vars.amount > 0) {
    return Math.round((vars.cost / vars.mileage) *
      vars.amount * 1e2) / 1e2
  }
  return vars.cost || 0
}
