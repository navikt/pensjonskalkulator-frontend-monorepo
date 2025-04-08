import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Alert, BodyLong, Link } from '@navikt/ds-react'

import { ReadMore } from '@/components/common/ReadMore'
import { paths } from '@/router/constants'
import {
  useGetGradertUfoereAfpFeatureToggleQuery,
  useGetOmstillingsstoenadOgGjenlevendeQuery,
} from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectAfp,
  selectNedreAldersgrense,
  selectNormertPensjonsalder,
  selectSamtykkeOffentligAFP,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputSlice'
import { formatUttaksalder } from '@/utils/alder'
import { getFormatMessageValues } from '@/utils/translations'

import { SanityReadmore } from '../common/SanityReadmore'

import styles from './TidligstMuligUttaksalder.module.scss'

interface Props {
  tidligstMuligUttak?: Alder
  ufoeregrad?: number
  show1963Text: boolean
}

export const TidligstMuligUttaksalder: React.FC<Props> = ({
  tidligstMuligUttak,
  ufoeregrad,
  show1963Text,
}) => {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { data: getGradertUfoereAfpFeatureToggle } =
    useGetGradertUfoereAfpFeatureToggleQuery()
  const { data: omstillingsstoenadOgGjenlevende } =
    useGetOmstillingsstoenadOgGjenlevendeQuery()

  const afp = useAppSelector(selectAfp)
  const nedreAldersgrense = useAppSelector(selectNedreAldersgrense)
  const normertPensjonsalder = useAppSelector(selectNormertPensjonsalder)
  const samtykkeOffentligAFP = useAppSelector(selectSamtykkeOffentligAFP)

  const formatertNedreAldersgrense = formatUttaksalder(intl, nedreAldersgrense)
  const formatertNormertPensjonsalder = formatUttaksalder(
    intl,
    normertPensjonsalder
  )

  const isGradertUfoereAfpToggleEnabled =
    getGradertUfoereAfpFeatureToggle?.enabled
  const hasAFP =
    isGradertUfoereAfpToggleEnabled &&
    ((afp === 'ja_offentlig' && samtykkeOffentligAFP) || afp === 'ja_privat')

  const goToAvansert: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault()
    dispatch(userInputActions.flushCurrentSimulation())
    navigate(paths.beregningAvansert)
  }

  const gradertIngress = hasAFP
    ? 'omufoeretrygd.gradert.ingress.afp'
    : 'omufoeretrygd.gradert.ingress'

  return (
    <div className={styles.wrapper} data-testid="tidligst-mulig-uttak">
      <div className={styles.wrapperCard} aria-live="polite">
        {!ufoeregrad && !tidligstMuligUttak && (
          <BodyLong size="medium" className={styles.ingress}>
            <FormattedMessage
              id="tidligstmuliguttak.error"
              values={{
                ...getFormatMessageValues(),
              }}
            />
          </BodyLong>
        )}

        {!!ufoeregrad && (
          <BodyLong size="medium" className={styles.ingress}>
            <FormattedMessage
              id={
                ufoeregrad === 100
                  ? 'omufoeretrygd.hel.ingress'
                  : gradertIngress
              }
              values={{
                ...getFormatMessageValues(),
                grad: ufoeregrad,
                link: (
                  <Link href="#" onClick={goToAvansert}>
                    <FormattedMessage id="omufoeretrygd.avansert_link" />
                  </Link>
                ),
                nedreAldersgrense: formatertNedreAldersgrense,
                normertPensjonsalder: formatertNormertPensjonsalder,
              }}
            />
          </BodyLong>
        )}

        {tidligstMuligUttak && (
          <>
            <BodyLong size="medium" className={styles.ingress}>
              <FormattedMessage
                id="tidligstmuliguttak.ingress_1"
                values={{
                  ...getFormatMessageValues(),
                }}
              />
            </BodyLong>

            <BodyLong size="medium" className={styles.highlighted}>
              {formatUttaksalder(intl, tidligstMuligUttak)}.
            </BodyLong>

            <BodyLong size="medium" className={styles.ingress}>
              <FormattedMessage
                id={`tidligstmuliguttak.${
                  show1963Text ? '1963' : '1964'
                }.ingress_2`}
                values={{
                  ...getFormatMessageValues(),
                }}
              />
            </BodyLong>
          </>
        )}

        {omstillingsstoenadOgGjenlevende?.harLoependeSak && (
          <Alert className={styles.alert} variant="info" aria-live="polite">
            <FormattedMessage
              id="tidligstmuliguttak.info_omstillingsstoenad_og_gjenlevende"
              values={{
                ...getFormatMessageValues(),
                normertPensjonsalder: formatertNormertPensjonsalder,
              }}
            />
          </Alert>
        )}

        {ufoeregrad ? (
          <SanityReadmore
            id={
              ufoeregrad === 100
                ? 'om_pensjonsalder_UT_hel'
                : 'om_pensjonsalder_UT_gradert_enkel'
            }
            className={styles.readmore}
          >
            <ReadMore
              name="Om ufoeretrygd og alderspensjon"
              className={styles.readmore}
              header={<FormattedMessage id="omufoeretrygd.readmore.title" />}
            >
              <FormattedMessage
                id={
                  ufoeregrad === 100
                    ? 'omufoeretrygd.readmore.hel.ingress'
                    : 'omufoeretrygd.readmore.gradert.ingress'
                }
                values={{
                  ...getFormatMessageValues(),
                  nedreAldersgrense: formatertNedreAldersgrense,
                  normertPensjonsalder: formatertNormertPensjonsalder,
                }}
              />
            </ReadMore>
          </SanityReadmore>
        ) : (
          <SanityReadmore id="om_TMU" className={styles.readmore}>
            <ReadMore
              name="Om pensjonsalder enkelt"
              className={styles.readmore}
              header={
                <FormattedMessage id="beregning.read_more.pensjonsalder.label" />
              }
            >
              <FormattedMessage
                id="beregning.read_more.pensjonsalder.body"
                values={{
                  ...getFormatMessageValues(),
                }}
              />
            </ReadMore>
          </SanityReadmore>
        )}
      </div>
    </div>
  )
}
