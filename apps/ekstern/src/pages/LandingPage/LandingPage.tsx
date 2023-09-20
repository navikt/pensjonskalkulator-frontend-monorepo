import React from 'react'
import { useNavigate } from 'react-router-dom'

import { BodyLong, Button, Heading, Loader, VStack } from '@navikt/ds-react'

import { Card } from '@/components/common/Card'
import { BASE_PATH } from '@/router'
import useRequest from '@/utils/useRequest'

export function LandingPage() {
  const { isLoading, status } = useRequest<null>(`${BASE_PATH}/oauth2/session`)
  const navigate = useNavigate()

  const isLoggedIn = React.useMemo(
    () => !isLoading && status === 200,
    [isLoading, status]
  )

  if (isLoading) {
    return <Loader />
  }

  return (
    <Card>
      <VStack gap="4">
        <section>
          <VStack gap="2">
            <Heading size="medium" level="2">
              For deg født før 1963
            </Heading>
            <BodyLong>
              Du må bruke vår detaljerte kalkulator for å beregne din pensjon.
            </BodyLong>
            <div>
              <Button variant="secondary" onClick={console.log}>
                {isLoggedIn
                  ? 'Detaljert kalkulator'
                  : 'Logg inn i detaljert kalkulator'}
              </Button>
            </div>
          </VStack>
        </section>

        <section>
          <VStack gap="2">
            <Heading size="medium" level="2">
              For deg født i 1963 eller senere
            </Heading>
            <BodyLong>
              Du kan velge mellom enkel eller detaljert kalkulator. Enkel
              kalkulator passer for deg som vil ha en rask oversikt. Detaljert
              kalkulator passer for deg som vil ha en mer spesifisert beregning.
              Enkel kalkulator er under utvikling. Derfor må du bruke detaljert
              kalkulator hvis du:
            </BodyLong>
            <ul>
              <li>
                har bodd eller jobbet utenfor Norge i mer enn 5 år etter fylte
                16 år
              </li>
              <li>mottar uføretrygd eller gjenlevendepensjon</li>
              <li>har hatt betydelig endring i inntekt de siste 2 årene</li>
              <li>har særaldersgrense</li>
            </ul>
            <div>
              <Button variant="secondary" onClick={console.log}>
                {isLoggedIn
                  ? 'Detaljert kalkulator'
                  : 'Logg inn i detaljert kalkulator'}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/start')}>
                {isLoggedIn
                  ? 'Enkel kalkulator'
                  : 'Logg inn i enkel kalkulator'}
              </Button>
            </div>
          </VStack>
        </section>

        {!isLoggedIn && (
          <section data-testid="uinlogget-kalkulator">
            <VStack gap="2">
              <Heading size="medium" level="2">
                Uinnlogget kalkulator
              </Heading>
              <BodyLong>
                For deg som ikke kan logge inn på nav.no. Kalkulatoren henter
                ikke inn eller lagrer noen opplysninger om deg. Du må finne og
                oppgi alle opplysningene selv og den beregner kun alderspensjon
                fra folketrygden (NAV).
              </BodyLong>
            </VStack>
          </section>
        )}
        <a href="">Personopplysninger som brukes i enkel kalkulator</a>
      </VStack>
    </Card>
  )
}
