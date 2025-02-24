import { useIntl } from 'react-intl'

import { ExternalLinkIcon } from '@navikt/aksel-icons'
import { Link } from '@navikt/ds-react'

import { logOpenLink } from '@/utils/logging'

export const ExternalLink = ({
  children,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const intl = useIntl()

  return (
    <Link onClick={logOpenLink} target="_blank" inlineText {...rest}>
      {children}
      <ExternalLinkIcon
        title={intl.formatMessage({ id: 'application.global.external_link' })}
        width="1.25rem"
        height="1.25rem"
      />
    </Link>
  )
}
