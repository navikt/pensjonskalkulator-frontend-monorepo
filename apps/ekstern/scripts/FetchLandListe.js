import fs from 'fs'
import prettier from 'prettier'

const urls = {
  staging:
    'https://staging.ekstern.dev.nav.no/pensjon/kalkulator/api/v1/land-liste',
  production: 'https://www.nav.no/pensjon/kalkulator/api/v1/land-liste',
}

const environment = process.argv[2] ?? 'staging'
const url = urls[environment]
if (!url) {
  console.error(
    `Unknown environment "${environment}", expected one of: ${Object.keys(urls).join(', ')}`
  )
  process.exit(1)
}

fetch(url)
  .then(async (response) => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const landListe = await response.json()
    if (!Array.isArray(landListe) || landListe.length === 0) {
      throw new Error('Expected a non-empty list')
    }
    const formattedJson = await prettier.format(JSON.stringify(landListe), {
      parser: 'json',
    })
    fs.writeFileSync('./src/assets/land-liste.json', formattedJson)
  })
  .catch((error) => {
    console.error(`Error while fetching or processing ${url}`, error)
  })
