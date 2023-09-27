import { FormattedMessage } from 'react-intl'

import { BodyLong, Button, Heading, HStack, VStack } from '@navikt/ds-react'

import { Card } from '../common/Card'
import { externalUrls } from '@/router'
import { wrapLogger } from '@/utils/logging'

interface IProps {
  onAvbryt: () => void
}

const gaaTilDetaljertKalkulator = () => {
  window.open(externalUrls.detaljertKalkulator, '_self')
}

export const Henvisning1963: React.FC<IProps> = ({ onAvbryt }) => {
  return (
    <Card
      data-testId="henvisning-1963"
      aria-live="polite"
      hasLargePadding
      hasMargin
    >
      <Heading level="2" size="medium" spacing>
        <FormattedMessage id="error.du_kan_ikke_bruke_enkel_kalkulator" />
      </Heading>
      <VStack gap="4">
        <BodyLong size="large">
          <FormattedMessage id="henvisning1963.body" />
        </BodyLong>

        <HStack gap="4">
          <Button
            type="button"
            data-testid="henvisning-1963.gaa-til-detaljert-kalkulator-knapp"
            variant="primary"
            onClick={wrapLogger('button klikk', { tekst: 'Tilbake' })(
              gaaTilDetaljertKalkulator
            )}
          >
            <FormattedMessage id="henvisning1963.detaljert_kalkulator" />
          </Button>
          <Button
            data-testid="henvisning-1963.avbryt-knapp"
            type="button"
            variant="secondary"
            onClick={wrapLogger('button klikk', { tekst: 'Avbryt' })(onAvbryt)}
          >
            <FormattedMessage id="stegvisning.avbryt" />
          </Button>
        </HStack>
      </VStack>
    </Card>
  )
}
