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
  let root = 'https://raw.githubusercontent.com/Sheco/cocain/master/samples/'
  let samples = {
    'Bibs': root + 'bibs.json',
    'Chocomilk': root + 'chocomilk.json',
    'Stickers': root + 'stickers.json',
    'Chocoavena': root + 'chocoavena.json',
    'Fabric Tree': root + 'tree.json'
  }

  let samplesUl = document.getElementById('samples')
  for (let [name, url] of Object.entries(samples)) {
    let html = document
      .createRange()
      .createContextualFragment(`<li><a href="${url}" onclick="return loadJSON('${url}')">${name}</a></li>`)
    samplesUl.appendChild(html)
  }
}

document.addEventListener('DOMContentLoaded', onLoad, false)