import { ExternalLinkIcon } from '@navikt/aksel-icons'
import { Link } from '@navikt/ds-react'

import { externalUrls } from '@/router'
/* eslint-disable @typescript-eslint/no-explicit-any */
export const formatMessageValues: Record<string, any> = {
  detaljertKalkulatorLink: (chunks: string) => (
    <Link href={externalUrls.detaljertKalkulator} target="_blank" inlineText>
      {chunks}
      <ExternalLinkIcon width="1.25rem" height="1.25rem" aria-hidden />
    </Link>
  ),
  dinPensjonLink: (chunks: string) => (
    <Link href={externalUrls.dinPensjon} target="_blank" inlineText>
      {chunks}
      <ExternalLinkIcon width="1.25rem" height="1.25rem" aria-hidden />
    </Link>
  ),
  dinPensjonBeholdningLink: (chunks: string) => (
    <Link href={externalUrls.dinPensjonBeholdning} target="_blank" inlineText>
      {chunks}
      <ExternalLinkIcon width="1.25rem" height="1.25rem" aria-hidden />
    </Link>
  ),
  alderspensjonsreglerLink: (chunks: string) => (
    <Link href={externalUrls.alderspensjonsregler} target="_blank" inlineText>
      {chunks}
      <ExternalLinkIcon width="1.25rem" height="1.25rem" aria-hidden />
    </Link>
  ),
  garantiPensjonLink: (chunks: string) => (
    <Link href={externalUrls.garantipensjon} target="_blank" inlineText>
      {chunks}
      <ExternalLinkIcon width="1.25rem" height="1.25rem" aria-hidden />
    </Link>
  ),
  afpLink: (chunks: string) => (
    <Link href={externalUrls.afp} target="_blank" inlineText>
      {chunks}
      <ExternalLinkIcon width="1.25rem" height="1.25rem" aria-hidden />
    </Link>
  ),
  norskPensjonLink: (chunks: string) => (
    <Link href={externalUrls.norskPensjkon} target="_blank" inlineText>
      {chunks}
      <ExternalLinkIcon width="1.25rem" height="1.25rem" aria-hidden />
    </Link>
  ),
  br: <br />,
}
/* eslint-enable @typescript-eslint/no-explicit-any */
