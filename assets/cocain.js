/* eslint-env browser */
/* global prettyPrintJson */

let progress
let result
let src
let csv
let csv2

function calculate () {
  progress.style.display = ''
  document.getElementById('progress').scrollIntoView()

  fetch('/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ src: src.value })
  })
    .then(async response => {
      let json = await response.json()
      if (response.status === 200) return json
      throw Error(`/api returned ${response.status}: ${response.statusText}\n\n${json.error}`)
    })
    .then(data => {
      result.innerHTML = prettyPrintJson.toHtml(data)
    })
    .catch(error => alert(error.message))
    .then(() => {
      progress.style.display = 'none'
    })
}

function loadJSON (url) { // eslint-disable-line no-unused-vars
  fetch(url, { method: 'GET' })
    .then(async response => {
      let text = await response.text()
      if (response.status === 200) return text
      throw Error(`${url} returned ${response.status}: ${response.statusText}\n\n${text}`)
    })
    .then(data => {
      src.value = data
      calculate()
    })
    .catch(error => alert(error.message))
}

function convertCsv () { // eslint-disable-line no-unused-vars
  let formData = new FormData()
  formData.append('csv', csv.files[0])
  formData.append('csv2', csv2.files[0])

  fetch('/convertCsv', {
    method: 'POST',
    body: formData
  })
    .then(async response => {
      let text = await response.text()
      if (response.status === 200) return text
      throw Error(`/convertCsv returned ${response.status}: ${response.statusText}\n\n${text}`)
    })
    .then(data => {
      src.value = data
      calculate()
    })
    .catch(error => alert(error.message))
}

function onLoad () { // eslint-disable-line no-unused-vars
  progress = document.getElementById('progress')
  result = document.getElementById('result')
  src = document.getElementById('src')
  csv = document.getElementById('csv')
  csv2 = document.getElementById('csv2')

  const aLoadJSON = function () {
    loadJSON(this.href)
    return false
  }

  for (let a of document.getElementsByClassName('loadJSON')) {
    a.onclick = aLoadJSON
  }
}

document.addEventListener('DOMContentLoaded', onLoad, false)
