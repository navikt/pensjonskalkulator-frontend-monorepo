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

export const SanityKortforbehold = ({
	id,
	size = 'small',
	className,
}: Props) => {
	const intl = useIntl()
	const { kortforbeholdData } = React.useContext(SanityContext)
	const sanityContent = kortforbeholdData?.[id]

	if (!sanityContent) {
		return null
	}

	const portableTextComponents = getSanityPortableTextComponents({ intl, size })
	const innhold = sanityContent.innhold.map((block) => {
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
	})

	return (
		<BodyLong size={size} className={className} data-testid={id} as="div">
			<PortableText value={innhold} components={portableTextComponents} />
		</BodyLong>
	)
}
