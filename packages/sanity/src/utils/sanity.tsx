import type { PortableTextReactComponents } from '@portabletext/react'
import { createClient } from '@sanity/client'
import { type MouseEvent, type ReactNode } from 'react'
import type { IntlShape } from 'react-intl'

import { ExternalLinkIcon } from '@navikt/aksel-icons'
import { Link, List } from '@navikt/ds-react'

export type DynamicValues = Record<string, string | number>
type PortableTextComponentSize = 'small' | 'medium'

interface SanityPortableTextComponentsParams {
	intl: IntlShape
	onLinkClick?: () => void
	navigateToRoute?: (route: string) => void
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
	size?: PortableTextComponentSize,
	navigateToRoute?: (route: string) => void
): Partial<PortableTextReactComponents> => {
	const {
		intl: resolvedIntl,
		onLinkClick: resolvedOnLinkClick,
		navigateToRoute: resolvedNavigateToRoute,
		dynamicValues: resolvedDynamicValues,
		size: resolvedSize,
	} = isSanityPortableTextComponentsParams(intlOrParams)
		? intlOrParams
		: {
				intl: intlOrParams,
				onLinkClick,
				navigateToRoute,
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
					valueType?: string
					gMultiplier?: string
				}
			}) => {
				const key = value?.valueType === 'gMultiple' ? 'G' : value?.key
				const placeholder = `{${key ?? ''}}`

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
				value?: {
					linkType?: 'anchor' | 'route' | 'external'
					href?: string
					anchorId?: string
					route?: string
					blank?: boolean
					className?: string
				}
				children?: ReactNode
			}) => {
				const linkType =
					value?.linkType ??
					(value?.href?.startsWith('#') ? 'anchor' : 'external')
				const href =
					linkType === 'anchor'
						? value?.anchorId
							? `#${value.anchorId}`
							: value?.href
						: linkType === 'route'
							? value?.route
							: value?.href

				if ((linkType === 'anchor' || linkType === 'route') && !href) {
					return children
				}

				const handleAnchorClick = (event: MouseEvent<HTMLAnchorElement>) => {
					event.preventDefault()
					resolvedOnLinkClick?.()

					const targetId =
						value?.anchorId ??
						(value?.href?.startsWith('#') ? value.href.slice(1) : undefined)
					const target = targetId ? document.getElementById(targetId) : null
					if (target) {
						const offsetTop =
							target.getBoundingClientRect().top + window.scrollY
						window.scrollTo({ top: offsetTop - 15, behavior: 'smooth' })
					}
				}

				const handleRouteClick = (event: MouseEvent<HTMLAnchorElement>) => {
					if (
						!resolvedNavigateToRoute ||
						!value?.route ||
						event.defaultPrevented ||
						event.button !== 0 ||
						event.metaKey ||
						event.ctrlKey ||
						event.shiftKey ||
						event.altKey
					) {
						return
					}

					event.preventDefault()
					resolvedNavigateToRoute(value.route)
				}

				return linkType === 'external' && value?.blank ? (
					<Link
						onClick={resolvedOnLinkClick}
						href={href}
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
						onClick={
							linkType === 'route'
								? handleRouteClick
								: linkType === 'anchor'
									? handleAnchorClick
									: resolvedOnLinkClick
						}
						href={href}
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
