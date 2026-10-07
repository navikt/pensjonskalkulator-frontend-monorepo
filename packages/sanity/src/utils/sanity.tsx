import type { PortableTextReactComponents } from '@portabletext/react'
import { createClient } from '@sanity/client'
import { type ReactNode } from 'react'
import type { IntlShape } from 'react-intl'

import { ExternalLinkIcon } from '@navikt/aksel-icons'
import { Link, List } from '@navikt/ds-react'

export type DynamicValues = Record<string, string | number>
type PortableTextComponentSize = 'small' | 'medium'

interface SanityPortableTextComponentsParams {
	intl: IntlShape
	onLinkClick?: () => void
	dynamicValues?: DynamicValues
	size?: PortableTextComponentSize
}

const isSanityPortableTextComponentsParams = (
	value: IntlShape | SanityPortableTextComponentsParams
): value is SanityPortableTextComponentsParams =>
	'intl' in value &&
	typeof value.intl === 'object' &&
	value.intl !== null &&
	'formatMessage' in value.intl

export interface CreateSanityClientOptions {
	projectId: string
	dataset: string
	useCdn?: boolean
	apiVersion?: string
}

export const createSanityAppClient = ({
	projectId,
	dataset,
	useCdn = true,
	apiVersion = '2025-07-02',
}: CreateSanityClientOptions) =>
	createClient({ projectId, dataset, useCdn, apiVersion })

export const getSanityPortableTextComponents = (
	intlOrParams: IntlShape | SanityPortableTextComponentsParams,
	onLinkClick?: () => void,
	dynamicValues?: DynamicValues,
	size?: PortableTextComponentSize
): Partial<PortableTextReactComponents> => {
	const {
		intl: resolvedIntl,
		onLinkClick: resolvedOnLinkClick,
		dynamicValues: resolvedDynamicValues,
		size: resolvedSize,
	} = isSanityPortableTextComponentsParams(intlOrParams)
		? intlOrParams
		: {
				intl: intlOrParams,
				onLinkClick,
				dynamicValues,
				size,
			}

	return {
		types: {
			dynamicValue: ({
				value,
			}: {
				value?: {
					key?: string
					label?: string
					valueType?: string
					gMultiplier?: string
					anchorId?: string
					url?: string
					openInNewTab?: boolean
				}
			}) => {
				const key = value?.valueType === 'gMultiple' ? 'G' : value?.key
				const placeholder = `{${key ?? ''}}`

				if (
					value?.valueType === 'internalLink' ||
					value?.valueType === 'externalLink'
				) {
					const isExternal = value.valueType === 'externalLink'
					const href = isExternal
						? value.url
						: value.anchorId
							? `#${value.anchorId}`
							: undefined

					if (!href) {
						return <span>{placeholder}</span>
					}

					return (
						<Link
							onClick={resolvedOnLinkClick}
							href={href}
							target={value.openInNewTab ? '_blank' : undefined}
							inlineText
						>
							{value.label?.trim() || (isExternal ? value.url : value.anchorId)}
							{value.openInNewTab && (
								<ExternalLinkIcon
									title={resolvedIntl.formatMessage({
										id: 'application.global.external_link',
									})}
									width="1.25rem"
									height="1.25rem"
								/>
							)}
						</Link>
					)
				}

				if (!key) {
					return <span>{placeholder}</span>
				}

				const resolved = resolvedDynamicValues?.[key]

				if (resolved === undefined) {
					return <span>{placeholder}</span>
				}

				switch (value?.valueType) {
					case 'string':
						return typeof resolved === 'string' ? (
							<span>{resolved}</span>
						) : (
							<span>{placeholder}</span>
						)
					case 'number':
						return typeof resolved === 'number' ? (
							<span>{resolvedIntl.formatNumber(resolved)}</span>
						) : (
							<span>{placeholder}</span>
						)
					case 'gMultiple': {
						const multiplier = Number(value.gMultiplier)
						return typeof resolved === 'number' &&
							[1, 2, 3].includes(multiplier) ? (
							<span>{resolvedIntl.formatNumber(resolved * multiplier)}</span>
						) : (
							<span>{placeholder}</span>
						)
					}
					default:
						return <span>{String(resolved)}</span>
				}
			},
		},
		list: {
			bullet: ({ children }) => (
				<List as="ul" size={resolvedSize}>
					{children}
				</List>
			),
			number: ({ children }) => (
				<List as="ol" size={resolvedSize}>
					{children}
				</List>
			),
		},
		listItem: {
			bullet: ({ children }) => <List.Item>{children}</List.Item>,
			number: ({ children }) => <List.Item>{children}</List.Item>,
		},
		block: {
			listTitle: ({ children }) => <p className="list-title">{children}</p>,
		},
		marks: {
			link: ({
				value,
				children,
			}: {
				value?: { blank: boolean; href: string; className?: string }
				children?: ReactNode
			}) => {
				return value?.blank ? (
					<Link
						onClick={resolvedOnLinkClick}
						href={value?.href}
						target="_blank"
						inlineText
						className={value?.className}
					>
						{children}
						<ExternalLinkIcon
							title={resolvedIntl.formatMessage({
								id: 'application.global.external_link',
							})}
							width="1.25rem"
							height="1.25rem"
						/>
					</Link>
				) : (
					<Link
						onClick={resolvedOnLinkClick}
						href={value?.href}
						inlineText
						className={value?.className}
					>
						{children}
					</Link>
				)
			},
		},
	}
}
