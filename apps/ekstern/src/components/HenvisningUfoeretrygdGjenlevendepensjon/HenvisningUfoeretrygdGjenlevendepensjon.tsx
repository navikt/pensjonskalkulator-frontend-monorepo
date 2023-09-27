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

export const HenvisningUfoeretrygdGjenlevendepensjon: React.FC<IProps> = ({
  onAvbryt,
}) => {
  return (
    <Card
      data-testid="henvisning-ufoere-gjenlevende"
      aria-live="polite"
      hasLargePadding
      hasMargin
    >
      <Heading level="2" size="medium" spacing>
        <FormattedMessage id="error.du_kan_ikke_bruke_enkel_kalkulator" />
      </Heading>

      <VStack gap="4">
        <BodyLong size="large">
          <FormattedMessage id="henvisning_ufoere_gjenlevende.body" />
        </BodyLong>

        <HStack gap="4">
          <Button
            type="button"
            data-testid="henvisning-ufoere-gjenlevende.gaa-til-detaljert-kalkulator-knapp"
            variant="primary"
            onClick={wrapLogger('button klikk', { tekst: 'Tilbake' })(
              gaaTilDetaljertKalkulator
            )}
          >
            <FormattedMessage id="henvisning_ufoere_gjenlevende.detaljert_kalkulator" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            data-testid="henvisning-ufoere-gjenlevende.avbryt-knapp"
            onClick={wrapLogger('button klikk', { tekst: 'Avbryt' })(onAvbryt)}
          >
            <FormattedMessage id="stegvisning.avbryt" />
          </Button>
        </HStack>
      </VStack>
    </Card>
  )
}
