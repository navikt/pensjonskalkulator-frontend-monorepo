import { createClient } from '@sanity/client'
import fs from 'fs'
import { dirname, resolve } from 'path'
import prettier from 'prettier'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = resolve(__dirname, '../../mocks/src/data')

const dataset = process.env.SANITY_DATASET ?? 'development'
const locale = process.env.SANITY_LOCALE ?? 'nb'

const sanityClient = createClient({
	projectId: 'g2by7q6m',
	dataset,
	useCdn: true,
	apiVersion: '2025-07-02',
})

const forbeholdAvsnittQuery =
	'*[_type == "forbeholdAvsnitt" && language == $locale && (visEkstern == true || visIntern == true)] | order(order asc) | {_id,overskrift,visEkstern,visIntern,"innhold":coalesce(innholdEkstern,innholdIntern),innholdEkstern,innholdIntern,alltidSynlig,vilkaar}'

const guidePanelQuery =
	'*[_type == "guidepanel" && language == $locale] | {name,overskrift,innhold}'

const readMoreQuery =
	'*[_type == "readmore" && language == $locale] | {name,overskrift,innhold}'

const alertQuery =
	'*[_type == "alert" && (!defined(language) || language == $locale)] | {name,type,status,overskrift,innhold}'

async function fetchAndSaveSanityData() {
	try {
		console.log(
			`📡 Fetching Sanity data (dataset=${dataset}, locale=${locale})…`
		)

		const [forbeholdAvsnittData, guidePanelData, readMoreData, alertData] =
			await Promise.all([
				sanityClient.fetch(forbeholdAvsnittQuery, { locale }),
				sanityClient.fetch(guidePanelQuery, { locale }),
				sanityClient.fetch(readMoreQuery, { locale }),
				sanityClient.fetch(alertQuery, { locale }),
			])

		const files = [
			{
				name: 'sanity-forbehold-avsnitt-data.json',
				data: forbeholdAvsnittData,
			},
			{ name: 'sanity-guidepanel-data.json', data: guidePanelData },
			{ name: 'sanity-readmore-data.json', data: readMoreData },
			{ name: 'sanity-alert-data.json', data: alertData },
		]

		for (const { name, data } of files) {
			const dest = resolve(DATA_DIR, name)
			const prettierConfig = (await prettier.resolveConfig(dest)) ?? {}
			const formatted = await prettier.format(
				JSON.stringify({ result: data || [] }),
				{ ...prettierConfig, parser: 'json' }
			)
			fs.writeFileSync(dest, formatted)
			console.log(`✅ Wrote ${dest}`)
		}
	} catch (error) {
		console.error('❌ Failed to fetch Sanity CMS data:', error)
		process.exit(1)
	}
}

fetchAndSaveSanityData()
