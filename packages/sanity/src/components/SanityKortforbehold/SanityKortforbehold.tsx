import { PortableText } from '@portabletext/react'
import React from 'react'
import { useIntl } from 'react-intl'

import { BodyLong } from '@navikt/ds-react'

import { SanityContext } from '../../context/SanityContext'
import { getSanityPortableTextComponents } from '../../utils/sanity'

interface Props {
	id: string
	size?: 'small' | 'medium'
	className?: string
}

/**
 * Rendrer det korte forbeholdet fra Sanity (document type `kortforbehold`),
 * slått opp via `id` (Sanity-feltet `name`) i `SanityContext`. Returnerer
 * `null` hvis innholdet ikke finnes, på samme måte som de andre Sanity-drevne
 * komponentene.
 */
export const SanityKortforbehold = ({
	id,
	size = 'small',
	className,
}: Props) => {
	const intl = useIntl()
	const { kortforbeholdData } = React.useContext(SanityContext)
	const sanityContent = kortforbeholdData?.[id]

	const portableTextComponents = React.useMemo(
		() => getSanityPortableTextComponents({ intl, size }),
		[intl, size]
	)
	const innhold = React.useMemo(
		() =>
			sanityContent?.innhold.map((block) => {
				const firstTextChildIndex =
					block.children?.findIndex((child) => child.text !== undefined) ?? -1

				return {
					...block,
					children: block.children?.map((child, index) =>
						index === firstTextChildIndex
							? { ...child, text: child.text?.replace(/^\s+/, '') }
							: child
					),
				}
			}) ?? [],
		[sanityContent?.innhold]
	)

	if (!sanityContent) {
		return null
	}

	return (
		<BodyLong size={size} className={className} data-testid={id} as="div">
			<PortableText value={innhold} components={portableTextComponents} />
		</BodyLong>
	)
}
