import { Link as ReactRouterLink } from 'react-router-dom'

import { ExternalLinkIcon } from '@navikt/aksel-icons'
import { Link } from '@navikt/ds-react'

import { externalUrls, paths } from '@/router'
/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO skrive tester
export const formatMessageValues: Record<string, any> = {
  detaljertKalkulatorLink: (chunks: string) => (
    <Link href={externalUrls.detaljertKalkulator} target="_blank">
      {chunks}
      <ExternalLinkIcon width="1.25rem" height="1.25rem" aria-hidden />
    </Link>
  ),
  dinPensjonLink: (chunks: string) => (
    <Link href={externalUrls.dinPensjon} target="_blank">
      {chunks}
      <ExternalLinkIcon width="1.25rem" height="1.25rem" aria-hidden />
    </Link>
  ),
  alderspensjonsreglerLink: (chunks: string) => (
    <Link href={externalUrls.alderspensjonsregler} target="_blank">
      {chunks}
      <ExternalLinkIcon width="1.25rem" height="1.25rem" aria-hidden />
    </Link>
  ),
  garantiPensjonLink: (chunks: string) => (
    <Link href={externalUrls.garantipensjon} target="_blank">
      {chunks}
      <ExternalLinkIcon width="1.25rem" height="1.25rem" aria-hidden />
    </Link>
  ),
  afpLink: (chunks: string) => (
    <Link href={externalUrls.afp} target="_blank">
      {chunks}
      <ExternalLinkIcon width="1.25rem" height="1.25rem" aria-hidden />
    </Link>
  ),
  norskPensjkonLink: (chunks: string) => (
    <Link href={externalUrls.norskPensjkon} target="_blank">
      {chunks}
      <ExternalLinkIcon width="1.25rem" height="1.25rem" aria-hidden />
    </Link>
  ),
  startLink: (chunks: string) => (
    <Link as={ReactRouterLink} to={paths.start}>
      {chunks}
    </Link>
  ),
  br: <br />,
}
/* eslint-enable @typescript-eslint/no-explicit-any */
