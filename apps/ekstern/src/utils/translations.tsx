import { createIntl, createIntlCache } from 'react-intl'

import { ExternalLinkIcon } from '@navikt/aksel-icons'
import { Link } from '@navikt/ds-react'

import { getCookie, getTranslations } from '@/context/LanguageProvider/utils'
import { externalUrls } from '@/router'

/* c8 ignore next 1 */
const locale = getCookie('decorator-language') || 'nb'
const cache = createIntlCache()
const intl = createIntl(
  {
    locale,
    messages: getTranslations(locale),
  },
  cache
)

/* eslint-disable @typescript-eslint/no-explicit-any */
export const formatMessageValues: Record<string, any> = {
  detaljertKalkulatorLink: (chunks: string) => (
    <Link href={externalUrls.detaljertKalkulator} target="_blank" inlineText>
      {chunks}
      <ExternalLinkIcon
        title={intl.formatMessage({ id: 'application.global.external_link' })}
        width="1.25rem"
        height="1.25rem"
      />
    </Link>
  ),
  dinPensjonLink: (chunks: string) => (
    <Link href={externalUrls.dinPensjon} target="_blank" inlineText>
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
    <Link href={externalUrls.dinPensjonBeholdning} target="_blank" inlineText>
      {chunks}
      <ExternalLinkIcon
        title={intl.formatMessage({ id: 'application.global.external_link' })}
        width="1.25rem"
        height="1.25rem"
      />
    </Link>
  ),
  alderspensjonsreglerLink: (chunks: string) => (
    <Link href={externalUrls.alderspensjonsregler} target="_blank" inlineText>
      {chunks}
      <ExternalLinkIcon
        title={intl.formatMessage({ id: 'application.global.external_link' })}
        width="1.25rem"
        height="1.25rem"
      />
    </Link>
  ),
  garantiPensjonLink: (chunks: string) => (
    <Link href={externalUrls.garantipensjon} target="_blank" inlineText>
      {chunks}
      <ExternalLinkIcon
        title={intl.formatMessage({ id: 'application.global.external_link' })}
        width="1.25rem"
        height="1.25rem"
      />
    </Link>
  ),
  afpLink: (chunks: string) => (
    <Link href={externalUrls.afp} target="_blank" inlineText>
      {chunks}
      <ExternalLinkIcon
        title={intl.formatMessage({ id: 'application.global.external_link' })}
        width="1.25rem"
        height="1.25rem"
      />
    </Link>
  ),
  norskPensjonLink: (chunks: string) => (
    <Link href={externalUrls.norskPensjon} target="_blank" inlineText>
      {chunks}
      <ExternalLinkIcon
        title={intl.formatMessage({ id: 'application.global.external_link' })}
        width="1.25rem"
        height="1.25rem"
      />
    </Link>
  ),
  navPersonvernerklaeringLink: (chunks: string) => (
    <Link href={externalUrls.personvernerklaering} target="_blank" inlineText>
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
}
/* eslint-enable @typescript-eslint/no-explicit-any */
