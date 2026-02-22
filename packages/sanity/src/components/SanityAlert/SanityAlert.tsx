import { PortableText } from '@portabletext/react'
import clsx from 'clsx'
import { useContext } from 'react'
import { useIntl } from 'react-intl'

import {
	GlobalAlert,
	InfoCard,
	InlineMessage,
	LocalAlert,
} from '@navikt/ds-react'

import { SanityContext } from '../../context/SanityContext'
import { getSanityPortableTextComponents } from '../../utils/sanity'
import styles from './SanityAlert.module.scss'

type AlertType = 'global-alert' | 'local-alert' | 'info-card' | 'inline-message'
type AlertStatus = 'info' | 'success' | 'warning' | 'error'

const infoCardColorMap = {
	info: 'info',
	success: 'success',
	warning: 'warning',
	error: 'danger',
} as const

const alertStatusMap: Record<
	AlertStatus,
	'announcement' | 'success' | 'warning' | 'error'
> = {
	info: 'announcement',
	success: 'success',
	warning: 'warning',
	error: 'error',
}

interface Props {
	id: string
	className?: string
	onLinkClick?: () => void
}

export const SanityAlert = ({ id, className, onLinkClick }: Props) => {
	const intl = useIntl()
	const { alertData } = useContext(SanityContext)
	const sanityContent = alertData[id]

	if (!sanityContent) {
		return null
	}

	const alertType = (sanityContent.type ?? 'local-alert') as AlertType
	const status = (sanityContent.status ?? 'info') as AlertStatus
	const portableTextComponents = getSanityPortableTextComponents(
		intl,
		onLinkClick
	)

	const content = (
		<PortableText
			value={sanityContent.innhold}
			components={portableTextComponents}
		/>
	)

	switch (alertType) {
		case 'global-alert':
			return (
				<GlobalAlert
					status={alertStatusMap[status]}
					className={clsx(styles.wrapper, className)}
					data-testid={sanityContent.name}
				>
					{sanityContent.overskrift && (
						<GlobalAlert.Header>
							<GlobalAlert.Title>{sanityContent.overskrift}</GlobalAlert.Title>
						</GlobalAlert.Header>
					)}
					<GlobalAlert.Content>{content}</GlobalAlert.Content>
				</GlobalAlert>
			)

		case 'info-card':
			return (
				<InfoCard
					data-color={infoCardColorMap[status]}
					className={clsx(styles.wrapper, className)}
					data-testid={sanityContent.name}
				>
					{sanityContent.overskrift && (
						<InfoCard.Header>
							<InfoCard.Title>{sanityContent.overskrift}</InfoCard.Title>
						</InfoCard.Header>
					)}
					<InfoCard.Content>{content}</InfoCard.Content>
				</InfoCard>
			)

		case 'inline-message':
			return (
				<InlineMessage
					status={status}
					className={clsx(styles.wrapper, className)}
					data-testid={sanityContent.name}
				>
					{content}
				</InlineMessage>
			)

		case 'local-alert':
		default:
			return (
				<LocalAlert
					status={alertStatusMap[status]}
					className={clsx(styles.wrapper, className)}
					data-testid={sanityContent.name}
				>
					{sanityContent.overskrift && (
						<LocalAlert.Header>
							<LocalAlert.Title>{sanityContent.overskrift}</LocalAlert.Title>
						</LocalAlert.Header>
					)}
					<LocalAlert.Content>{content}</LocalAlert.Content>
				</LocalAlert>
			)
	}
}
