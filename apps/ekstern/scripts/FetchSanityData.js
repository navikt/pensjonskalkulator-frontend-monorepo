import { createClient } from '@sanity/client'
import fs from 'fs'
import { defineQuery } from 'groq'
import prettier from 'prettier'

const sanityClient = createClient({
  projectId: 'g2by7q6m',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2025-07-02',
})

const forbeholdAvsnittQuery = defineQuery(
  '*[_type == "forbeholdAvsnitt" && language == $locale] | order(order asc) | {overskrift,innhold}'
)

const guidePanelQuery = defineQuery(
  '*[_type == "guidepanel" && language == $locale] | {name,overskrift,innhold}'
)

const readMoreQuery = defineQuery(
  '*[_type == "readmore" && language == $locale] | {name,overskrift,innhold}'
)

async function fetchAndSaveSanityData() {
  try {
    const locale = 'nb'

    const [forbeholdAvsnittData, guidePanelData, readMoreData] =
      await Promise.all([
        sanityClient.fetch(forbeholdAvsnittQuery, { locale }),
        sanityClient.fetch(guidePanelQuery, { locale }),
        sanityClient.fetch(readMoreQuery, { locale }),
      ])

    const forbeholdAvsnittFormatted = await prettier.format(
      JSON.stringify({ result: forbeholdAvsnittData || [] }),
      { parser: 'json' }
    )
    fs.writeFileSync(
      './src/mocks/data/sanity-forbehold-avsnitt-data.json',
      forbeholdAvsnittFormatted
    )

    const guidePanelFormatted = await prettier.format(
      JSON.stringify({ result: guidePanelData || [] }),
      { parser: 'json' }
    )
    fs.writeFileSync(
      './src/mocks/data/sanity-guidepanel-data.json',
      guidePanelFormatted
    )

    const readMoreFormatted = await prettier.format(
      JSON.stringify({ result: readMoreData || [] }),
      { parser: 'json' }
    )
    fs.writeFileSync(
      './src/mocks/data/sanity-readmore-data.json',
      readMoreFormatted
    )
  } catch (error) {
    console.error('❌ Failed to fetch Sanity CMS data:', error)
    process.exit(1)
  }
}

fetchAndSaveSanityData()
