import { PortableTextReactComponents } from '@portabletext/react'
import { createClient } from '@sanity/client'
import { IntlShape } from 'react-intl'

import { ExternalLinkIcon } from '@navikt/aksel-icons'
import { Link } from '@navikt/ds-react'

import { logOpenLink } from './logging'

const dataset =
  window.location.href.includes('ekstern.dev') ||
  window.location.href.includes('localhost')
    ? 'development'
    : 'production'

export const sanityClient = createClient({
  projectId: 'g2by7q6m',
  dataset,
  useCdn: true, // set to `false` to bypass the edge cache
  apiVersion: '2023-05-03', // use current date (YYYY-MM-DD) to target the latest API version
})

export const getSanityPortableTextComponents = (
  intl: IntlShape
): Partial<PortableTextReactComponents> => {
  return {
    marks: {
      link: ({
        value,
        children,
      }: {
        value?: { blank: boolean; href: string; className?: string }
        children?: React.ReactNode
      }) => {
        return value?.blank ? (
          <Link
            onClick={logOpenLink}
            href={value?.href}
            target="_blank"
            inlineText
            className={value?.className}
          >
            {children}
            <ExternalLinkIcon
              title={intl.formatMessage({
                id: 'application.global.external_link',
              })}
              width="1.25rem"
              height="1.25rem"
            />
          </Link>
        ) : (
          <Link
            onClick={logOpenLink}
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
