/* eslint-env browser */
/* global prettyPrintJson */

let progress
let result
let src
let csv

function calculate () {
  progress.style.display = ''
  document.getElementById('progress').scrollIntoView()

  fetch('/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ src: src.value })
  })
    .then(response => {
      if (response.status === 200) return response.json()
      throw Error(`/api returned ${response.status}`)
    })
    .then(data => {
      result.innerHTML = prettyPrintJson.toHtml(data)
      progress.style.display = 'none'
    })
    .catch(error => alert(error.message))
}

function loadJSON (url) { // eslint-disable-line no-unused-vars
  fetch(url, { method: 'GET' })
    .then(response => {
      if (response.status === 200) return response.text()
      throw Error(`${url} returned ${response.status}`)
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

  fetch('/convertCsv', {
    method: 'POST',
    body: formData
  })
    .then(response => {
      if (response.status === 200) return response.text()
      throw Error(`/convertCsv returned ${response.status}: ${response.statusText}`)
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
}

document.addEventListener('DOMContentLoaded', onLoad, false)
