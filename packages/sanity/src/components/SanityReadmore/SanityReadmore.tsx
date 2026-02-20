import { PortableText } from '@portabletext/react'
import clsx from 'clsx'
import React from 'react'
import { useIntl } from 'react-intl'

import { ReadMore } from '@navikt/ds-react'

import { SanityContext } from '../../context/SanityContext'
import { getSanityPortableTextComponents } from '../../utils/sanity'
import styles from './SanityReadmore.module.scss'

interface Props {
	id: string
	className?: string
	onLinkClick?: () => void
	onOpenChange?: (open: boolean) => void
}

export const SanityReadmore = ({
	id,
	className,
	onLinkClick,
	onOpenChange,
}: Props) => {
	const intl = useIntl()
	const { readMoreData } = React.useContext(SanityContext)
	const sanityContent = readMoreData[id]

	return (
		<ReadMore
			data-testid={sanityContent.name}
			header={sanityContent.overskrift}
			className={clsx(styles.wrapper, className)}
			onOpenChange={onOpenChange}
		>
			<PortableText
				value={sanityContent.innhold}
				components={getSanityPortableTextComponents(intl, onLinkClick)}
			/>
		</ReadMore>
	)
}
