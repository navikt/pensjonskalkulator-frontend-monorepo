import { FormattedMessage, useIntl } from 'react-intl'

import { ExternalLinkIcon } from '@navikt/aksel-icons'
import { Button, Heading, Link } from '@navikt/ds-react'

import { InfoOmFremtidigVedtak } from '@/components/InfoOmFremtidigVedtak'
import { Card } from '@/components/common/Card'
import { externalUrls } from '@/router/constants'
import { isLoependeVedtakEndring } from '@/utils/loependeVedtak'
import { logOpenLink, wrapLogger } from '@/utils/logging'

import { FridaPortrett } from './FridaPortrett'
import { StartIngress } from './StartIngress'
import { StartIngressEndring } from './StartIngressEndring'
import { StartIngressPre2025OffentligAfp } from './StartIngressPre2025OffentligAfp'

import styles from './Start.module.scss'

interface Props {
  navn: string
  loependeVedtak: LoependeVedtak
  onCancel?: () => void
  onNext?: () => void
}

export function StartForBrukereUnder75({
  navn,
  loependeVedtak,
  onCancel,
  onNext,
}: Props) {
  const intl = useIntl()
  const isEndring = isLoependeVedtakEndring(loependeVedtak)
  const fremtidigAlderspensjon = loependeVedtak.fremtidigAlderspensjon
  const isEndringAndFremtidigVedtak = isEndring && !!fremtidigAlderspensjon

  return (
    <>
      <InfoOmFremtidigVedtak loependeVedtak={loependeVedtak} isCentered />

      <Card hasLargePadding hasMargin>
        <div className={styles.wrapper}>
          <div className={styles.image} aria-hidden>
            <FridaPortrett />
          </div>
          <div className={styles.wrapperText}>
            <Heading level="2" size="medium" spacing>
              {`${intl.formatMessage({
                id: 'stegvisning.start.title',
              })} ${navn}!`}
            </Heading>

            {getIngressComponent()}

            {onNext && !isEndringAndFremtidigVedtak && (
              <Button
                data-testid="stegvisning-start-button"
                type="submit"
                className={styles.button}
                onClick={wrapLogger('button klikk', {
                  tekst: 'Kom i gang',
                })(onNext)}
              >
                <FormattedMessage id="stegvisning.start.button" />
              </Button>
            )}

            {onCancel && (
              <Button
                data-testid="stegvisning-avbryt-button"
                type="button"
                className={styles.button}
                variant="tertiary"
                onClick={wrapLogger('button klikk', { tekst: 'Avbryt' })(
                  onCancel
                )}
              >
                <FormattedMessage id="stegvisning.avbryt" />
              </Button>
            )}
          </div>
        </div>

        <Link
          onClick={logOpenLink}
          className={styles.link}
          href={externalUrls.personopplysninger}
          target="_blank"
          inlineText
        >
          <FormattedMessage id="stegvisning.start.link" />
          <ExternalLinkIcon
            title={intl.formatMessage({
              id: 'application.global.external_link',
            })}
            width="1.25rem"
            height="1.25rem"
          />
        </Link>
      </Card>
    </>
  )

  function getIngressComponent() {
    if (loependeVedtak.pre2025OffentligAfp) {
      return <StartIngressPre2025OffentligAfp loependeVedtak={loependeVedtak} />
    } else if (isEndring) {
      return <StartIngressEndring loependeVedtak={loependeVedtak} />
    }
    return <StartIngress />
  }
}
