import { IntlShape } from 'react-intl'

import { ExternalLinkIcon } from '@navikt/aksel-icons'
import { Link } from '@navikt/ds-react'

import { externalUrls } from '@/router/constants'

import { logOpenLink } from './logging'

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getFormatMessageValues = (
  intl: IntlShape
): Record<string, any> => {
  return {
    detaljertKalkulatorLink: (chunks: string) => (
      <Link
        onClick={logOpenLink}
        href={externalUrls.detaljertKalkulator}
        target="_blank"
        inlineText
      >
        {chunks}
        <ExternalLinkIcon
          title={intl.formatMessage({ id: 'application.global.external_link' })}
          width="1.25rem"
          height="1.25rem"
        />
      </Link>
    ),
    dinPensjonLink: (chunks: string) => (
      <Link
        onClick={logOpenLink}
        href={externalUrls.dinPensjon}
        target="_blank"
        inlineText
      >
        {chunks}
        title={intl.formatMessage({ id: 'application.global.external_link' })}
        <ExternalLinkIcon
          title={intl.formatMessage({ id: 'application.global.external_link' })}
          width="1.25rem"
          height="1.25rem"
        />
      </Link>
    ),
    dinPensjonBeholdningLink: (chunks: string) => (
      <Link
        onClick={logOpenLink}
        href={externalUrls.dinPensjonBeholdning}
        target="_blank"
        inlineText
      >
        {chunks}
        <ExternalLinkIcon
          title={intl.formatMessage({ id: 'application.global.external_link' })}
          width="1.25rem"
          height="1.25rem"
        />
      </Link>
    ),
    alderspensjonsreglerLink: (chunks: string) => (
      <Link
        onClick={logOpenLink}
        href={externalUrls.alderspensjonsregler}
        target="_blank"
        inlineText
      >
        {chunks}
        <ExternalLinkIcon
          title={intl.formatMessage({ id: 'application.global.external_link' })}
          width="1.25rem"
          height="1.25rem"
        />
      </Link>
    ),
    garantiPensjonLink: (chunks: string) => (
      <Link
        onClick={logOpenLink}
        href={externalUrls.garantipensjon}
        target="_blank"
        inlineText
      >
        {chunks}
        <ExternalLinkIcon
          title={intl.formatMessage({ id: 'application.global.external_link' })}
          width="1.25rem"
          height="1.25rem"
        />
      </Link>
    ),
    afpLink: (chunks: string) => (
      <Link
        onClick={logOpenLink}
        href={externalUrls.afp}
        target="_blank"
        inlineText
      >
        {chunks}
        <ExternalLinkIcon
          title={intl.formatMessage({ id: 'application.global.external_link' })}
          width="1.25rem"
          height="1.25rem"
        />
      </Link>
    ),
    norskPensjonLink: (chunks: string) => (
      <Link
        onClick={logOpenLink}
        href={externalUrls.norskPensjon}
        target="_blank"
        inlineText
      >
        {chunks}
        <ExternalLinkIcon
          title={intl.formatMessage({ id: 'application.global.external_link' })}
          width="1.25rem"
          height="1.25rem"
        />
      </Link>
    ),
    navPersonvernerklaeringLink: (chunks: string) => (
      <Link
        onClick={logOpenLink}
        href={externalUrls.personvernerklaering}
        target="_blank"
        inlineText
      >
        {chunks}
        <ExternalLinkIcon
          title={intl.formatMessage({ id: 'application.global.external_link' })}
          width="1.25rem"
          height="1.25rem"
        />
      </Link>
    ),
    navPersonvernerklaeringKontaktOss: (chunks: string) => (
      <Link
        onClick={logOpenLink}
        href={externalUrls.personvernerklaeringKontaktOss}
        target="_blank"
        inlineText
      >
        {chunks}
        <ExternalLinkIcon
          title={intl.formatMessage({ id: 'application.global.external_link' })}
          width="1.25rem"
          height="1.25rem"
        />
      </Link>
    ),
    br: <br />,
    // TODO utvide test
    strong: (chunks: string) => <strong>{chunks}</strong>,
    nowrap: (chunks: string) => <span className="nowrap">{chunks}</span>,
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
