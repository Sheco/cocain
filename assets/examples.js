/* eslint-env browser */

let examples = {
  'chocomilk60': JSON.parse('{"resources":[{"name":"milk","unit":"ml","cost":"1","capacity":"1000","amount":""},{"name":"chocolate","unit":"g","cost":"2","capacity":"400","amount":""}],"products":[{"info":{"name":"chocolate milk","amount":"60","markup":"2"},"recipe":[{"stage":"product","resource":"milk","amount":"200"},{"stage":"product","resource":"chocolate","amount":"25"}]}]}'),
  'chocomilkLimited': JSON.parse('{"resources":[{"name":"milk","unit":"ml","cost":"1","capacity":"1000","amount":"5"},{"name":"chocolate","unit":"g","cost":"2","capacity":"400","amount":"2"}],"products":[{"info":{"name":"chocolate milk","amount":"0","markup":"2"},"recipe":[{"stage":"product","resource":"milk","amount":"230"},{"stage":"product","resource":"chocolate","amount":"25"}]}]}'),
  'development': JSON.parse('{"resources":[{"name":"Developer","unit":"h","cost":"50","capacity":"1","amount":"10"},{"name":"Electricity","unit":"w","cost":".002","capacity":"1","amount":"2000"},{"name":"Coffee","unit":" cups","cost":"1","capacity":"1","amount":"10"}],"products":[{"info":{"name":"simple website","amount":"1","markup":"2"},"recipe":[{"stage":"product","resource":"Developer","amount":"8"},{"stage":"product","resource":"Electricity","amount":"1600"},{"stage":"product","resource":"Coffee","amount":"8"}]},{"info":{"name":"Conference","amount":"1","markup":"2"},"recipe":[{"stage":"product","resource":"Developer","amount":"1"},{"stage":"product","resource":"Electricity","amount":"60"}]}]}')
}

function load (name) {
  sessionStorage.setObj('data', examples[name])
  window.location = '/'
}
