/* standard cost calculator
 *
 * Mandatory variables:
 * capacity: the capacity for each container of this resource
 * cost: cost for each container
 *
 * Optional variables:
 * amount: the maximum amount of containers available
 * type: the type of resource (defaults to 'standard')
 */
module.exports = function (vars) {
  if (vars.waste === undefined) {
    vars.amount = Math.ceil(vars.consumed / (vars.capacity || 1))
    vars.waste = (vars.amount * vars.capacity) - vars.consumed
  }
  return Math.round(((vars.cost * vars.amount) || 0) * 100) / 100
}
