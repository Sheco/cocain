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
module.exports = function (vars) {
  if (!vars.capacity) {
    if (vars.amount === undefined) {
      vars.amount = vars.consumed
    }
    vars.cost = Math.round(((vars.cost * vars.consumed) || 0) * 1e2) / 1e2
    return
  }

  /* if the amount is undefined, we'll calculate the amount of containers
   * spent and the leftover waste */
  if (vars.amount === undefined) {
    vars.amount = Math.ceil(vars.consumed / vars.capacity)
    vars.waste = (vars.amount * vars.capacity) - vars.consumed
  }

  /* The cost is that of the amount of containers */
  vars.cost = Math.round(((vars.cost * vars.amount) || 0) * 1e2) / 1e2
}
