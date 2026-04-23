import {
	SanityContext,
	getSanityPortableTextComponents,
} from '@pensjonskalkulator-frontend-monorepo/sanity'
import { PortableText } from '@portabletext/react'
import { useContext } from 'react'
import { useIntl } from 'react-intl'

import { BodyLong, Heading } from '@navikt/ds-react'

export const Forbehold = () => {
	const intl = useIntl()
	const { forbeholdAvsnittData } = useContext(SanityContext)

	return (
		<div>
			<Heading level="2" size="medium" spacing>
				Forbehold
			</Heading>
			{forbeholdAvsnittData.map((forbeholdAvsnitt, i) =>
				forbeholdAvsnitt.overskrift ? (
					<section key={i}>
						<Heading level="3" size="small" spacing>
							{forbeholdAvsnitt.overskrift}
						</Heading>
						<BodyLong spacing as="div">
							<PortableText
								value={forbeholdAvsnitt.innhold}
								components={getSanityPortableTextComponents(intl)}
							/>
						</BodyLong>
					</section>
				) : (
					<BodyLong key={i} spacing as="div">
						<PortableText
							value={forbeholdAvsnitt.innhold}
							components={getSanityPortableTextComponents(intl)}
						/>
					</BodyLong>
				)
			)}
		</div>
	)
}
