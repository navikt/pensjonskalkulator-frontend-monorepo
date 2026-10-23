import { PortableText } from '@portabletext/react'
import clsx from 'clsx'
import {
	type AriaAttributes,
	type HTMLAttributes,
	type ReactNode,
	useContext,
} from 'react'
import { useIntl } from 'react-intl'

import {
	ArrowCirclepathIcon,
	CheckmarkCircleFillIcon,
	ExclamationmarkTriangleFillIcon,
	ExclamationmarkTriangleIcon,
	InformationSquareFillIcon,
	InformationSquareIcon,
	LightBulbIcon,
	XMarkIcon,
	XMarkOctagonFillIcon,
} from '@navikt/aksel-icons'
import {
	Button,
	GlobalAlert,
	InfoCard,
	InlineMessage,
	LocalAlert,
} from '@navikt/ds-react'

import { SanityContext } from '../../context/SanityContext'
import {
	type DynamicValues,
	getSanityPortableTextComponents,
} from '../../utils/sanity'
import styles from './SanityAlert.module.scss'

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
	onClose?: () => void
	onButtonClick?: () => void
	role?: HTMLAttributes<HTMLDivElement>['role']
	'aria-live'?: AriaAttributes['aria-live']
}

export const SanityAlert = ({
	id,
	className,
	dynamicValues,
	onLinkClick,
	onClose,
	onButtonClick,
	role,
	'aria-live': ariaLive,
}: Props) => {
	const intl = useIntl()
	const { alertData, navigateToRoute } = useContext(SanityContext)
	const sanityContent = alertData[id]

	if (!sanityContent) {
		return null
	}

	const alertType = (sanityContent.type ?? 'local-alert') as AlertType
	const status = (sanityContent.status ?? 'info') as AlertStatus
	const infoCardStatus = sanityContent.infoCardStatus ?? status
	const portableTextComponents = getSanityPortableTextComponents({
		intl,
		onLinkClick,
		navigateToRoute,
		dynamicValues,
	})

	const buttonLabel =
		typeof sanityContent.buttonLabel === 'string'
			? sanityContent.buttonLabel.trim()
			: ''
	const actionButton =
		buttonLabel && onButtonClick ? (
			<Button
				className={styles.actionButton}
				size="small"
				iconPosition="right"
				variant="tertiary"
				onClick={onButtonClick}
				icon={<ArrowCirclepathIcon aria-hidden />}
			>
				{buttonLabel}
			</Button>
		) : null
	const content = (
		<>
			<PortableText
				value={sanityContent.innhold}
				components={portableTextComponents}
			/>
			{actionButton}
		</>
	)

	const closeButton = onClose && (
		<Button
			size="small"
			variant="tertiary-neutral"
			icon={<XMarkIcon aria-hidden />}
			onClick={onClose}
			aria-label="Lukk"
		/>
	)

	switch (alertType) {
		case 'global-alert':
			return (
				<GlobalAlert
					size="medium"
					status={alertStatusMap[status]}
					className={clsx(styles.wrapper, className)}
					data-testid={sanityContent.name}
					aria-live={ariaLive}
					role={role}
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
						size="medium"
						data-color={infoCardColorMap[infoCardStatus]}
						className={clsx(styles.wrapper, styles.message, className)}
						data-testid={sanityContent.name}
						aria-live={ariaLive}
						role={role}
					>
						<InfoCard.Message icon={infoCardIconMap[infoCardStatus]}>
							{onClose ? (
								<div className={styles.closableAlert}>
									<div>{content}</div>
									{closeButton}
								</div>
							) : (
								content
							)}
						</InfoCard.Message>
					</InfoCard>
				)
			}

			return (
				<InfoCard
					size="medium"
					data-color={infoCardColorMap[infoCardStatus]}
					className={clsx(styles.wrapper, className)}
					data-testid={sanityContent.name}
					aria-live={ariaLive}
					role={role}
				>
					{sanityContent.overskrift && (
						<InfoCard.Header
							icon={
								infoCardStatus === 'attention' || infoCardStatus === 'tips'
									? infoCardIconMap[infoCardStatus]
									: undefined
							}
						>
							<InfoCard.Title>{sanityContent.overskrift}</InfoCard.Title>
						</InfoCard.Header>
					)}
					<InfoCard.Content>{content}</InfoCard.Content>
				</InfoCard>
			)
		}

		case 'inline-message':
			return (
				<InlineMessage
					size="medium"
					status={status}
					className={clsx(styles.wrapper, className)}
					data-testid={sanityContent.name}
					aria-live={ariaLive}
					role={role}
				>
					{content}
				</InlineMessage>
			)

		case 'local-alert':
		default:
			return (
				<LocalAlert
					size="medium"
					status={alertStatusMap[status]}
					className={clsx(styles.wrapper, className)}
					data-testid={sanityContent.name}
					aria-live={ariaLive}
					role={role}
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
