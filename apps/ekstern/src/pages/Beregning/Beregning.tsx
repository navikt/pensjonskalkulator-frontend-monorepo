import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { ToggleGroup } from '@navikt/ds-react'
import Highcharts from 'highcharts'
import HighchartsAccessibility from 'highcharts/modules/accessibility'

import { Loader } from '@/components/common/Loader'
import { TilbakeEllerAvslutt } from '@/components/TilbakeEllerAvslutt'
import { paths } from '@/router/constants'
import { useTidligsteUttaksalderQuery } from '@/state/api/apiSlice'
import {
  useGetHighchartsAccessibilityPluginFeatureToggleQuery,
  useGetDetaljertFaneFeatureToggleQuery,
} from '@/state/api/apiSlice'
import { generateTidligsteHelUttaksalderRequestBody } from '@/state/api/utils'
import { useAppDispatch } from '@/state/hooks'
import { useAppSelector } from '@/state/hooks'
import {
  selectAfp,
  selectSamboer,
  selectSivilstand,
  selectAarligInntektFoerUttak,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

import { BeregningAvansert } from './BeregningAvansert'
import { BeregningEnkel } from './BeregningEnkel'

import styles from './Beregning.module.scss'

type BeregningVisning = 'enkel' | 'avansert'
interface Props {
  visning: BeregningVisning
}

export const Beregning: React.FC<Props> = ({ visning }) => {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const harSamboer = useAppSelector(selectSamboer)
  const sivilstand = useAppSelector(selectSivilstand)
  const afp = useAppSelector(selectAfp)
  const aarligInntektFoerUttak = useAppSelector(selectAarligInntektFoerUttak)

  const [tidligsteUttaksalderRequestBody, setTidligsteUttaksalderRequestBody] =
    React.useState<TidligsteUttaksalderRequestBody | undefined>(undefined)

  const { data: highchartsAccessibilityFeatureToggle } =
    useGetHighchartsAccessibilityPluginFeatureToggleQuery()
  const { data: detaljertFaneFeatureToggle } =
    useGetDetaljertFaneFeatureToggleQuery()

  // Hent tidligst mulig uttaksalder
  const {
    data: tidligstMuligUttak,
    isLoading: isTidligstMuligUttaksalderLoading,
    isError: isTidligstMuligUttaksalderError,
  } = useTidligsteUttaksalderQuery(tidligsteUttaksalderRequestBody, {
    skip: !tidligsteUttaksalderRequestBody,
  })

  React.useEffect(() => {
    /* c8 ignore next 3 */
    if (highchartsAccessibilityFeatureToggle?.enabled) {
      HighchartsAccessibility(Highcharts)
    }
    document.title = intl.formatMessage({
      id: 'application.title.beregning',
    })
  }, [])

  React.useEffect(() => {
    const requestBody = generateTidligsteHelUttaksalderRequestBody({
      afp,
      sivilstand: sivilstand,
      harSamboer,
      aarligInntektFoerUttak: aarligInntektFoerUttak ?? 0,
    })
    setTidligsteUttaksalderRequestBody(requestBody)
  }, [afp, sivilstand, aarligInntektFoerUttak, harSamboer])

  const onToggleChange = (v: string) => {
    navigate(v === 'enkel' ? paths.beregningEnkel : paths.beregningDetaljert)
    dispatch(userInputActions.flushCurrentSimulation())
  }

  if (isTidligstMuligUttaksalderLoading) {
    return (
      <Loader
        data-testid="uttaksalder-loader"
        size="3xlarge"
        title={intl.formatMessage({
          id: 'beregning.loading',
        })}
      />
    )
  }

  return (
    <div className={styles.beregning}>
      {detaljertFaneFeatureToggle?.enabled && (
        <div className={styles.toggle}>
          <div className={styles.container}>
            <ToggleGroup
              defaultValue={visning}
              variant="neutral"
              onChange={onToggleChange}
            >
              <ToggleGroup.Item value="enkel">
                {intl.formatMessage({
                  id: 'beregning.toggle.enkel',
                })}
              </ToggleGroup.Item>
              <ToggleGroup.Item value="avansert">
                {intl.formatMessage({
                  id: 'beregning.toggle.avansert',
                })}
              </ToggleGroup.Item>
            </ToggleGroup>
          </div>
        </div>
      )}
      {visning === 'enkel' && (
        <BeregningEnkel
          tidligstMuligUttak={
            !isTidligstMuligUttaksalderError ? tidligstMuligUttak : undefined
          }
        />
      )}
      {visning === 'avansert' && <BeregningAvansert />}
      <div className={`${styles.background} ${styles.background__lightblue}`}>
        <div className={styles.container}>
          <TilbakeEllerAvslutt />
        </div>
      </div>
    </div>
  )
}
