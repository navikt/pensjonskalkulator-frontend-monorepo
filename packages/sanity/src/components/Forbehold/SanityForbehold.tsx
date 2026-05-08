import { PortableText } from '@portabletext/react'
import React from 'react'
import { useIntl } from 'react-intl'

import { BodyLong, Heading } from '@navikt/ds-react'

import type { ForbeholdAvsnittQueryResult } from '../../types/sanity.types'
import { getSanityPortableTextComponents } from '../../utils/sanity'

interface Props {
	avsnitt: ForbeholdAvsnittQueryResult
	title?: React.ReactNode
	avsnittTestId?: string
}

/**
 * Ren presentasjonskomponent: tar en allerede-filtrert liste forbeholdAvsnitt
 * og rendrer den. Vet ingenting om vilkår eller SanityContext. Bruk
 * `SanityVilkaarligForbehold` når du vil at vilkår skal evalueres.
 */
export const SanityForbehold = ({
	avsnitt,
	title = 'Forbehold',
	avsnittTestId,
}: Props) => {
	const intl = useIntl()

	const portableTextComponents = React.useMemo(
		() => getSanityPortableTextComponents(intl),
		[intl]
	)

	return (
		<>
			<Heading level="2" size="medium" spacing>
				{title}
			</Heading>
			{avsnitt.map((forbeholdAvsnitt, i) => {
				const key = forbeholdAvsnitt._id ?? i
				return forbeholdAvsnitt.overskrift ? (
					<section data-testid={avsnittTestId} key={key}>
						<Heading level="3" size="small" spacing>
							{forbeholdAvsnitt.overskrift}
						</Heading>
						<BodyLong spacing as="div">
							<PortableText
								value={forbeholdAvsnitt.innhold}
								components={portableTextComponents}
							/>
						</BodyLong>
					</section>
				) : (
					<BodyLong data-testid={avsnittTestId} key={key} spacing as="div">
						<PortableText
							value={forbeholdAvsnitt.innhold}
							components={portableTextComponents}
						/>
					</BodyLong>
				)
			})}
		</>
	)
}
