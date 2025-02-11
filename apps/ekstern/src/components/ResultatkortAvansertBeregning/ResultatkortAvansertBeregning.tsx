import React from 'react'
import { useIntl, FormattedMessage } from 'react-intl'

import { PencilIcon } from '@navikt/aksel-icons'
import { Button, ExpansionCard as ExpansionCardAksel } from '@navikt/ds-react'

import { ExpansionCard } from '@/components/common/ExpansionCard'
import { useGetPersonQuery } from '@/state/api/apiSlice'
import { useAppSelector } from '@/state/hooks'
import {
  selectAarligInntektFoerUttakBeloep,
  selectCurrentSimulation,
  selectIsEndring,
} from '@/state/userInput/selectors'
import { formatUttaksalder, transformUttaksalderToDate } from '@/utils/alder'
import { formatInntekt } from '@/utils/inntekt'
import { wrapLogger } from '@/utils/logging'
interface Props {
  onButtonClick: () => void
}

import styles from './ResultatkortAvansertBeregning.module.scss'

export const ResultatkortAvansertBeregning: React.FC<Props> = ({
  onButtonClick,
}) => {
  const intl = useIntl()
  const aarligInntektFoerUttakBeloep = useAppSelector(
    selectAarligInntektFoerUttakBeloep
  )
  const isEndring = useAppSelector(selectIsEndring)
  const { data: person } = useGetPersonQuery()

  const { uttaksalder, aarligInntektVsaHelPensjon, gradertUttaksperiode } =
    useAppSelector(selectCurrentSimulation)

  return (
    <ExpansionCard
      name="Resultatkort avansert beregning"
      className={styles.card}
      aria-labelledby="expansion-card-label"
      size="small"
    >
      <ExpansionCardAksel.Header>
        <ExpansionCardAksel.Title id="expansion-card-label" size="small">
          <FormattedMessage id="beregning.avansert.resultatkort.tittel" />
        </ExpansionCardAksel.Title>
        <ExpansionCardAksel.Description>
          <FormattedMessage id="beregning.avansert.resultatkort.description" />
        </ExpansionCardAksel.Description>
      </ExpansionCardAksel.Header>
      <ExpansionCardAksel.Content>
        <dl className={styles.list}>
          <dt className={styles.listTitle}>
            <FormattedMessage
              id={
                isEndring
                  ? 'beregning.avansert.resultatkort.frem_til_endring'
                  : 'beregning.avansert.resultatkort.frem_til_uttak'
              }
            />
          </dt>
          <dd className={styles.listDescription}>
            {intl.formatMessage({
              id: 'beregning.avansert.resultatkort.inntekt_1',
            })}
            : <span className="nowrap">{aarligInntektFoerUttakBeloep}</span>
            {intl.formatMessage({
              id: 'beregning.avansert.resultatkort.inntekt_2',
            })}
          </dd>
          {uttaksalder && gradertUttaksperiode?.uttaksalder && person && (
            <>
              <dt className={styles.listTitle}>
                {formatUttaksalder(
                  intl,
                  {
                    aar: gradertUttaksperiode.uttaksalder.aar,
                    maaneder: gradertUttaksperiode.uttaksalder.maaneder,
                  },
                  { compact: true }
                )}
                {` (${transformUttaksalderToDate(
                  gradertUttaksperiode.uttaksalder,
                  person?.foedselsdato as string
                )})`}
              </dt>
              <dd className={styles.listDescription}>
                {gradertUttaksperiode.grad && (
                  <>
                    {intl.formatMessage({
                      id: 'beregning.avansert.resultatkort.alderspensjon',
                    })}
                    {gradertUttaksperiode.grad} %<br />
                  </>
                )}
                {gradertUttaksperiode.aarligInntektVsaPensjonBeloep && (
                  <>
                    {intl.formatMessage({
                      id: 'beregning.avansert.resultatkort.inntekt_1',
                    })}
                    {': '}
                    <span className="nowrap">
                      {formatInntekt(
                        gradertUttaksperiode.aarligInntektVsaPensjonBeloep
                      )}
                    </span>
                    {intl.formatMessage({
                      id: 'beregning.avansert.resultatkort.inntekt_2',
                    })}
                  </>
                )}
              </dd>
            </>
          )}

          <dt className={styles.listTitle}>
            {uttaksalder && person && (
              <>{`${formatUttaksalder(
                intl,
                {
                  ...uttaksalder,
                },
                { compact: true }
              )}
                  (${transformUttaksalderToDate(
                    uttaksalder,
                    person?.foedselsdato as string
                  )})`}</>
            )}
          </dt>
          <dd className={styles.listDescription}>
            {intl.formatMessage({
              id: 'beregning.avansert.resultatkort.alderspensjon',
            })}
            100 %
            {aarligInntektVsaHelPensjon?.beloep && (
              <>
                <br />
                {intl.formatMessage({
                  id: 'beregning.avansert.resultatkort.inntekt_1',
                })}
                {intl.formatMessage({
                  id: aarligInntektVsaHelPensjon?.sluttAlder.maaneder
                    ? 'beregning.tom'
                    : 'beregning.til',
                })}
                {formatUttaksalder(
                  intl,
                  aarligInntektVsaHelPensjon?.sluttAlder,
                  {
                    compact: true,
                  }
                )}
                {': '}
                <span className="nowrap">
                  {aarligInntektVsaHelPensjon?.beloep}
                </span>
                {intl.formatMessage({
                  id: 'beregning.avansert.resultatkort.inntekt_2',
                })}
              </>
            )}
          </dd>
        </dl>

        <Button
          className={styles.button}
          variant="tertiary"
          icon={<PencilIcon aria-hidden />}
          onClick={wrapLogger('button klikk', {
            tekst: 'Resultatkort: Endre valg',
          })(onButtonClick)}
        >
          {intl.formatMessage({
            id: 'beregning.avansert.resultatkort.button',
          })}
        </Button>
      </ExpansionCardAksel.Content>
    </ExpansionCard>
  )
}
