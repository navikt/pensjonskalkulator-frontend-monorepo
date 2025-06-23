import React from 'react'
import { FormattedMessage } from 'react-intl'

import { HStack, Heading, VStack } from '@navikt/ds-react'

import { useAppSelector } from '@/state/hooks'
import { selectCurrentSimulation } from '@/state/userInput/selectors'
import { getFormatMessageValues } from '@/utils/translations'

import { DetaljRad } from '../hooks'

import styles from './Pensjonsdetaljer.module.scss'

export interface AlderspensjonDetaljerProps {
  alderspensjonDetaljerListe: DetaljRad[][]
  hasPre2025OffentligAfpUttaksalder: boolean
}

export const AlderspensjonDetaljer: React.FC<AlderspensjonDetaljerProps> = ({
  alderspensjonDetaljerListe,
  hasPre2025OffentligAfpUttaksalder,
}) => {
  const { uttaksalder, gradertUttaksperiode } = useAppSelector(
    selectCurrentSimulation
  )

  // Når alder for gradertUttak er lik uttaksalder, skal gradertUttak prioriteres og vises
  // men hvis hasPre2025OffentligAfpUttaksalder er true, skal heltUttak vises
  const hasSameAges = gradertUttaksperiode?.uttaksalder.aar === uttaksalder?.aar
  const showGradertWhenSameAges =
    hasSameAges && !hasPre2025OffentligAfpUttaksalder
  const showHeltWhenSameAges = hasSameAges && hasPre2025OffentligAfpUttaksalder

  const gradertUttak =
    alderspensjonDetaljerListe.length === 2
      ? alderspensjonDetaljerListe[0]
      : showGradertWhenSameAges
        ? (alderspensjonDetaljerListe[0] ?? [])
        : []
  const heltUttak =
    alderspensjonDetaljerListe.length === 2
      ? alderspensjonDetaljerListe[1]
      : !hasSameAges || showHeltWhenSameAges
        ? (alderspensjonDetaljerListe[0] ?? [])
        : []

  return (
    <VStack gap="20">
      {gradertUttaksperiode && !hasPre2025OffentligAfpUttaksalder && (
        <div className="gradertUttak">
          <Heading size="small" level="3">
            <FormattedMessage
              id="beregning.detaljer.grunnpensjon.gradertUttak.title"
              values={{
                ...getFormatMessageValues(),
                alderAar: `${gradertUttaksperiode?.uttaksalder.aar} år`,
                alderMd:
                  gradertUttaksperiode?.uttaksalder.maaneder &&
                  gradertUttaksperiode.uttaksalder.maaneder > 0
                    ? `og ${gradertUttaksperiode.uttaksalder.maaneder} måneder`
                    : '',
                grad: gradertUttaksperiode?.grad,
              }}
            />
          </Heading>
          <dl>
            <div className={styles.hstackRow}>
              <strong>
                <FormattedMessage id="beregning.detaljer.grunnpensjon.table.title" />
              </strong>
            </div>
            {gradertUttak.map((detalj, index) => (
              <React.Fragment key={index}>
                <HStack justify="space-between" className={styles.hstackRow}>
                  <dt>
                    {index === gradertUttak.length - 1 ? (
                      <strong>{detalj.tekst}:</strong>
                    ) : (
                      `${detalj.tekst}:`
                    )}
                  </dt>
                  <dd>
                    {index === gradertUttak.length - 1 ? (
                      <strong>{detalj.verdi}</strong>
                    ) : (
                      detalj.verdi
                    )}
                  </dd>
                </HStack>
              </React.Fragment>
            ))}
          </dl>
        </div>
      )}
      {(gradertUttaksperiode?.uttaksalder.aar !== uttaksalder!.aar ||
        showHeltWhenSameAges) && (
        <div className="heltUttak">
          <Heading size="small" level="3">
            <FormattedMessage
              id="beregning.detaljer.grunnpensjon.heltUttak.title"
              values={{
                ...getFormatMessageValues(),
                alderAar: hasPre2025OffentligAfpUttaksalder
                  ? '67 år'
                  : `${uttaksalder?.aar} år`,
                alderMd: hasPre2025OffentligAfpUttaksalder
                  ? ''
                  : uttaksalder?.maaneder && uttaksalder.maaneder > 0
                    ? `og ${uttaksalder.maaneder} måneder`
                    : '',
                grad: 100,
              }}
            />
          </Heading>
          <dl>
            <div className={styles.hstackRow}>
              <strong>
                <FormattedMessage id="beregning.detaljer.grunnpensjon.table.title" />
              </strong>
            </div>
            {heltUttak.map((detalj, index) => (
              <React.Fragment key={index}>
                <HStack justify="space-between" className={styles.hstackRow}>
                  <dt>
                    {index === heltUttak.length - 1 ? (
                      <strong>{detalj.tekst}:</strong>
                    ) : (
                      `${detalj.tekst}:`
                    )}
                  </dt>
                  <dd>
                    {index === heltUttak.length - 1 ? (
                      <strong>{detalj.verdi}</strong>
                    ) : (
                      detalj.verdi
                    )}
                  </dd>
                </HStack>
              </React.Fragment>
            ))}
          </dl>
        </div>
      )}
    </VStack>
  )
}
