/* Gas
 *
 * mandatory variables:
 * price: price per unit (liter/galon)
 * mileage: vehicle's mileage
 *
 * optional variables:
 * amount: the amount of gas you prepurchased, if there's any wasted gas
 *  it will be considered in the cost
 */
module.exports = function (vars) {
  if (vars.amount > 0) {
    return Math.round((vars.cost / vars.mileage) *
      vars.amount * 100) / 100
  }
  return vars.cost || 0
}
