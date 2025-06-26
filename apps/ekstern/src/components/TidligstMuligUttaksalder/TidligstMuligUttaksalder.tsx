import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Alert, BodyLong, Link } from '@navikt/ds-react'

import { SanityReadmore } from '@/components/common/SanityReadmore'
import { TelefonLink } from '@/components/common/TelefonLink'
import { paths } from '@/router/constants'
import { useGetOmstillingsstoenadOgGjenlevendeQuery } from '@/state/api/apiSlice'
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

import styles from './TidligstMuligUttaksalder.module.scss'

interface Props {
  tidligstMuligUttak?: Alder
  ufoeregrad?: number
  show1963Text: boolean
  loependeVedtakPre2025OffentligAfp?: boolean
  isOver75AndNoLoependeVedtak?: boolean
}

export const TidligstMuligUttaksalder = ({
  tidligstMuligUttak,
  ufoeregrad,
  show1963Text,
  loependeVedtakPre2025OffentligAfp,
  isOver75AndNoLoependeVedtak,
}: Props) => {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

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

  const hasAFP =
    (afp === 'ja_offentlig' && samtykkeOffentligAFP) || afp === 'ja_privat'

  const goToAvansert: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault()
    dispatch(userInputActions.flushCurrentSimulation())
    navigate(paths.beregningAvansert)
  }

  const tidligstMuligUttakIngressPre2025OffentligAFP = () => (
    <BodyLong
      size="medium"
      className={styles.ingress}
      data-testid="tidligstmuliguttak.pre2025OffentligAfp.ingress"
    >
      <FormattedMessage
        id="tidligstmuliguttak.pre2025OffentligAfp.ingress"
        values={{
          ...getFormatMessageValues(),
          link: (
            <Link href="#" onClick={goToAvansert}>
              <FormattedMessage
                id="tidligstmuliguttak.pre2025OffentligAfp.avansert_link"
                values={{
                  ...getFormatMessageValues(),
                }}
              />
            </Link>
          ),
        }}
      />
    </BodyLong>
  )

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

        {tidligstMuligUttak &&
          (loependeVedtakPre2025OffentligAfp ? (
            tidligstMuligUttakIngressPre2025OffentligAFP()
          ) : (
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

              {!isOver75AndNoLoependeVedtak && (
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
              )}
            </>
          ))}

        {omstillingsstoenadOgGjenlevende?.harLoependeSak && (
          <Alert className={styles.alert} variant="info" aria-live="polite">
            <FormattedMessage
              id="tidligstmuliguttak.info_omstillingsstoenad_og_gjenlevende"
              values={{
                ...getFormatMessageValues(),
                normertPensjonsalder: formatertNormertPensjonsalder,
                link: <TelefonLink />,
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
          />
        ) : (
          !loependeVedtakPre2025OffentligAfp && (
            <SanityReadmore id="om_TMU" className={styles.readmore} />
          )
        )}
      </div>
    </div>
  )
}
