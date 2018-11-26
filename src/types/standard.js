/* standard cost calculator
 *
 * Mandatory variables:
 * capacity: the capacity for each container of this resource
 * cost: if the object has a capacity, the cost is per container
 *   otherwise, the cost is per unit consumed
 *
 * Optional variables:
 * amount: the maximum amount of containers available
 * type: the type of resource (defaults to 'standard')
 */
module.exports = function (vars) {
  if (!vars.capacity) {
    return Math.round(((vars.cost * vars.consumed) || 0) * 100) / 100
  }

  /* if it doesn't have any waste and it has a capacity
   * then it consumed all of the containers,
   * this happens when the resource is specified with a capacity
   * but without a given amount of containers */
  if (vars.waste === undefined) {
    vars.amount = Math.ceil(vars.consumed / vars.capacity)
    vars.waste = (vars.amount * vars.capacity) - vars.consumed
  }

  /* if it has a capacity, the cost is that of the amount of containers */
  return Math.round(((vars.cost * vars.amount) || 0) * 100) / 100
}
