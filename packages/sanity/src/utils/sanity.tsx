import type { PortableTextReactComponents } from '@portabletext/react'
import { createClient } from '@sanity/client'
import { type ReactNode } from 'react'
import type { IntlShape } from 'react-intl'

import { ExternalLinkIcon } from '@navikt/aksel-icons'
import { Link, List } from '@navikt/ds-react'

export type DynamicValues = Record<string, string>
type PortableTextComponentSize = 'small' | 'medium'

interface SanityPortableTextComponentsParams {
	intl: IntlShape
	onLinkClick?: () => void
	dynamicValues?: DynamicValues
	size?: PortableTextComponentSize
}

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
	} =
		'formatMessage' in intlOrParams
			? {
					intl: intlOrParams,
					onLinkClick,
					dynamicValues,
					size,
				}
			: intlOrParams

	return {
		types: {
			dynamicValue: ({ value }: { value?: { key: string } }) => {
				const resolved = value?.key
					? resolvedDynamicValues?.[value.key]
					: undefined
				return <span>{resolved ?? `{${value?.key ?? ''}}`}</span>
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
