import { IntlShape } from 'react-intl'

import { ExternalLinkIcon } from '@navikt/aksel-icons'
import { Link } from '@navikt/ds-react'
import { PortableTextReactComponents } from '@portabletext/react'

import { logOpenLink } from './logging'

export const getSanityPortableTextComponents = (
  intl: IntlShape
): Partial<PortableTextReactComponents> => {
  return {
    marks: {
      link: ({
        value,
        children,
      }: {
        value?: { blank: boolean; href: string }
        children?: React.ReactNode
      }) => {
        return value?.blank ? (
          <Link
            onClick={logOpenLink}
            href={value?.href}
            target="_blank"
            inlineText
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
          <Link onClick={logOpenLink} href={value?.href} inlineText>
            {children}
          </Link>
        )
      },
    },
  }
}
