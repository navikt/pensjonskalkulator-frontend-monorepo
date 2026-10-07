import {
	type DynamicValues,
	SanityContext,
	getSanityPortableTextComponents,
} from '@pensjonskalkulator-frontend-monorepo/sanity'
import { PortableText } from '@portabletext/react'
import clsx from 'clsx'
import {
	type ReactElement,
	type ReactNode,
	cloneElement,
	useContext,
} from 'react'
import { useIntl } from 'react-intl'

import {
	CheckmarkCircleFillIcon,
	ExclamationmarkTriangleFillIcon,
	ExclamationmarkTriangleIcon,
	InformationSquareFillIcon,
	InformationSquareIcon,
	LightBulbIcon,
	XMarkOctagonFillIcon,
} from '@navikt/aksel-icons'
import {
	GlobalAlert,
	InfoCard,
	InlineMessage,
	LocalAlert,
} from '@navikt/ds-react'

import styles from './SanityAlert.module.css'

type AlertType = 'global-alert' | 'local-alert' | 'info-card' | 'inline-message'
type AlertStatus = 'info' | 'success' | 'warning' | 'error'
type InfoCardStatus = AlertStatus | 'message' | 'attention' | 'tips'

const infoCardColorMap = {
	info: 'info',
	success: 'success',
	warning: 'warning',
	error: 'danger',
	message: 'info',
	attention: 'warning',
	tips: 'info',
} as const

const infoCardIconMap: Record<InfoCardStatus, ReactNode> = {
	info: <InformationSquareFillIcon aria-hidden />,
	success: <CheckmarkCircleFillIcon aria-hidden />,
	warning: <ExclamationmarkTriangleFillIcon aria-hidden />,
	error: <XMarkOctagonFillIcon aria-hidden />,
	message: <InformationSquareIcon aria-hidden />,
	attention: <ExclamationmarkTriangleIcon aria-hidden />,
	tips: <LightBulbIcon aria-hidden />,
}

const infoCardTitleMap: Partial<Record<InfoCardStatus, string>> = {
	attention: 'Pass på',
	tips: 'Tips',
}

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
	dynamicValues?: DynamicValues
	onLinkClick?: () => void
	children?: ReactElement<{ children?: ReactNode }>
}

export const SanityAlert = ({
	id,
	className,
	dynamicValues,
	onLinkClick,
	children,
}: Props) => {
	dynamicValues = { nbsp: '\u00A0', ...dynamicValues }
	const intl = useIntl()
	const { alertData } = useContext(SanityContext)
	const sanityContent = alertData[id]

	if (!sanityContent) {
		return null
	}

	const alertType = (sanityContent.type ?? 'local-alert') as AlertType
	const status = (sanityContent.status ?? 'info') as AlertStatus
	const infoCardStatus =
		(
			sanityContent as typeof sanityContent & {
				infoCardStatus?: InfoCardStatus | null
			}
		).infoCardStatus ?? status
	const portableTextComponents = getSanityPortableTextComponents(
		intl,
		onLinkClick,
		dynamicValues
	)
	const buttonLabel =
		'buttonLabel' in sanityContent &&
		typeof sanityContent.buttonLabel === 'string'
			? sanityContent.buttonLabel
			: null
	const childLabel = children?.props.children ?? buttonLabel
	const renderedChildren =
		children && childLabel != null
			? cloneElement(children, undefined, childLabel)
			: null

	const content = (
		<>
			<PortableText
				value={sanityContent.innhold}
				components={portableTextComponents}
			/>
			{renderedChildren}
		</>
	)

	switch (alertType) {
		case 'global-alert':
			return (
				<GlobalAlert
					status={alertStatusMap[status]}
					className={clsx(className)}
					data-testid={sanityContent.name}
					size="small"
				>
					{sanityContent.overskrift && (
						<GlobalAlert.Header>
							<GlobalAlert.Title>{sanityContent.overskrift}</GlobalAlert.Title>
						</GlobalAlert.Header>
					)}
					<GlobalAlert.Content>{content}</GlobalAlert.Content>
				</GlobalAlert>
			)

		case 'info-card': {
			if (infoCardStatus === 'message') {
				return (
					<InfoCard
						data-color={infoCardColorMap[infoCardStatus]}
						className={clsx(styles.infoCard, className)}
						data-testid={sanityContent.name}
						size="small"
					>
						<InfoCard.Message icon={infoCardIconMap[infoCardStatus]}>
							{content}
						</InfoCard.Message>
					</InfoCard>
				)
			}

			return (
				<InfoCard
					data-color={infoCardColorMap[infoCardStatus]}
					className={clsx(styles.infoCard, className)}
					data-testid={sanityContent.name}
					size="small"
				>
					{(sanityContent.overskrift || infoCardTitleMap[infoCardStatus]) && (
						<InfoCard.Header icon={infoCardIconMap[infoCardStatus]}>
							<InfoCard.Title>
								{sanityContent.overskrift ?? infoCardTitleMap[infoCardStatus]}
							</InfoCard.Title>
						</InfoCard.Header>
					)}
					<InfoCard.Content>{content}</InfoCard.Content>
				</InfoCard>
			)
		}

		case 'inline-message':
			return (
				<InlineMessage
					status={status}
					className={clsx(styles.wrapper, className)}
					data-testid={sanityContent.name}
					size="small"
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
					size="small"
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
