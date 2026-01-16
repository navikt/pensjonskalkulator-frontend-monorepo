import fs from 'fs'
import prettier from 'prettier'

const isCI = process.env.CI === 'true'
if (isCI) {
  // Output a mock land list and exit early in CI
  console.log(JSON.stringify([{ name: 'MockLand', code: 'XX' }]))
  process.exit(0)
}

fetch(`https://pensjonskalkulator-backend.intern.dev.nav.no/api/v1/land-liste`)
  .then((response) => response.text())
  .then(async (body) => {
    const formattedJson = await prettier.format(
      JSON.stringify(JSON.parse(body)),
      {
        parser: 'json',
      }
    )
    fs.writeFileSync('./src/assets/land-liste.json', formattedJson)
  })
  .catch((error) => {
    console.error(
      'Error while fetching or processing /api/v1/land-liste',
      error
    )
  })
