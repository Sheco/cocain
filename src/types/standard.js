module.exports = function (vars) {
  if (vars.waste === undefined) {
    return Math.round(vars.cost * vars.consumed * 100) / 100
  }
  return Math.round(((vars.cost * vars.amount) || 0) * 100) / 100
}
