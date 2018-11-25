module.exports = {
  unit: 'mL',
  fixedCost: function (vars) {
    return Math.round(vars.fixedCost *
      Math.ceil((vars.consumed + vars.amount) / vars.container) *
      100) / 100 || 0
  },
  unitCost: function (vars) {
    return vars.unitCost || 0
  }
}
