import clsx from 'clsx'
import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import {
  Accordion,
  BodyLong,
  HStack,
  Heading,
  HeadingProps,
  Link,
  ReadMore,
  VStack,
} from '@navikt/ds-react'

import { AccordionItem } from '@/components/common/AccordionItem'
import { paths } from '@/router/constants'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectLoependeVedtak,
  selectSivilstand,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputSlice'
import { BeregningVisning } from '@/types/common-types'
import {
  LINK_AAPNET,
  SHOW_MORE_AAPNET,
  SHOW_MORE_LUKKET,
} from '@/utils/loggerConstants'
import { logger } from '@/utils/logging'
import { formatSivilstand } from '@/utils/sivilstand'
import { getFormatMessageValues } from '@/utils/translations'

import { GrunnlagItem } from '../GrunnlagItem'
import { Pensjonsavtaler } from '../Pensjonsavtaler/Pensjonsavtaler'
import { AfpDetaljerGrunnlag } from '../Simulering/BeregningsdetaljerForOvergangskull/AfpDetaljerGrunnlag'
import { AlderspensjonDetaljerGrunnlag } from '../Simulering/BeregningsdetaljerForOvergangskull/AlderspensjonDetaljerGrunnlag'
import { useBeregningsdetaljer } from '../Simulering/BeregningsdetaljerForOvergangskull/hooks'
import { Pensjonsgivendeinntekt } from '../Simulering/Pensjonsgivendeinntekt'
import { GrunnlagAFP } from './GrunnlagAFP'
import { GrunnlagSection } from './GrunnlagSection'
import { GrunnlagUtenlandsopphold } from './GrunnlagUtenlandsopphold'

import styles from './Grunnlag.module.scss'

interface Props {
  visning: BeregningVisning
  headingLevel: HeadingProps['level']
  harForLiteTrygdetid?: boolean
  trygdetid?: number
  isEndring: boolean
  alderspensjonListe?: AlderspensjonPensjonsberegning[]
  afpPrivatListe?: AfpPrivatPensjonsberegning[]
  afpOffentligListe?: AfpPensjonsberegning[]
  pre2025OffentligAfp?: pre2025OffentligPensjonsberegning
}

export const Grunnlag: React.FC<Props> = ({
  visning,
  headingLevel,
  harForLiteTrygdetid,
  trygdetid,
  isEndring,
  alderspensjonListe,
  afpPrivatListe,
  afpOffentligListe,
  pre2025OffentligAfp,
}) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const goToAvansert: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault()
    dispatch(userInputActions.flushCurrentSimulation())
    navigate(paths.beregningAvansert)
  }

  const intl = useIntl()
  const loependeVedtak = useAppSelector(selectLoependeVedtak)
  const sivilstand = useAppSelector(selectSivilstand)

  const [isAFPDokumentasjonVisible, setIsAFPDokumentasjonVisible] =
    React.useState<boolean>(false)

  const [isAlderspensjonDetaljerVisible, setIsAlderspensjonDetaljerVisible] =
    React.useState<boolean>(false)

  const formatertSivilstand = React.useMemo(
    () => formatSivilstand(intl, sivilstand!),
    [sivilstand]
  )

  const { alderspensjonDetaljerListe, afpDetaljerListe } =
    useBeregningsdetaljer(
      alderspensjonListe,
      afpPrivatListe,
      afpOffentligListe,
      pre2025OffentligAfp
    )

  // Antall kolonner for AP detaljer som bestemmer hvor mange kolonner AFP detaljer skal ha.
  const alderspensjonColumnsCount =
    alderspensjonDetaljerListe.length === 0
      ? 0
      : [
          alderspensjonDetaljerListe[0].alderspensjon,
          alderspensjonDetaljerListe[0].opptjeningKap19,
          alderspensjonDetaljerListe[0].opptjeningKap20,
        ].filter((arr) => arr.length > 0).length

  // Når det ikke er noen detaljer for AFP, så er "Les mer" lenken skjult.
  const shouldHideAfpReadMore =
    afpDetaljerListe.length === 0 ||
    afpDetaljerListe.every(
      (afpDetaljer) =>
        afpDetaljer.afpPrivat.length === 0 &&
        afpDetaljer.afpOffentlig.length === 0 &&
        afpDetaljer.pre2025OffentligAfp.length === 0
    )

  const handleReadMoreChange = ({
    isOpen,
    ytelse,
  }: {
    isOpen: boolean
    ytelse: string
  }) => {
    if (ytelse === 'AFP') {
      setIsAFPDokumentasjonVisible(isOpen)
    } else {
      setIsAlderspensjonDetaljerVisible(isOpen)
    }

    const name = `Grunnlag: Vis detaljer for ${ytelse}`
    logger(isOpen ? SHOW_MORE_AAPNET : SHOW_MORE_LUKKET, { tekst: name })
  }

  return (
    <section className={styles.section}>
      <Heading level={headingLevel} size="medium">
        {isEndring || visning === 'avansert' ? (
          <FormattedMessage id="grunnlag.endring.title" />
        ) : (
          <FormattedMessage id="grunnlag.title" />
        )}
      </Heading>

      <HStack gap="8" marginBlock="6 0">
        {visning === 'enkel' && !isEndring && (
          <GrunnlagItem color="gray">
            <Pensjonsgivendeinntekt goToAvansert={goToAvansert} />
          </GrunnlagItem>
        )}

        {!isEndring && (
          <GrunnlagItem color="green">
            <Pensjonsavtaler headingLevel="3" />
          </GrunnlagItem>
        )}

        <GrunnlagItem color="purple">
          <GrunnlagAFP />

          {!shouldHideAfpReadMore && (
            <ReadMore
              name="Listekomponenter for AFP"
              open={isAFPDokumentasjonVisible}
              header={
                isAFPDokumentasjonVisible
                  ? intl.formatMessage(
                      {
                        id: 'beregning.detaljer.lukk',
                      },
                      {
                        ...getFormatMessageValues(),
                        ytelse: 'AFP',
                      }
                    )
                  : intl.formatMessage(
                      {
                        id: 'beregning.detaljer.vis',
                      },
                      {
                        ...getFormatMessageValues(),
                        ytelse: 'AFP',
                      }
                    )
              }
              className={clsx(
                styles.visListekomponenter,
                styles.wideDetailedView
              )}
              onOpenChange={(open) =>
                handleReadMoreChange({ isOpen: open, ytelse: 'AFP' })
              }
            >
              <AfpDetaljerGrunnlag
                afpDetaljerListe={afpDetaljerListe}
                alderspensjonColumnsCount={alderspensjonColumnsCount}
              />
              {pre2025OffentligAfp &&
                pre2025OffentligAfp.afpAvkortetTil70Prosent && (
                  <FormattedMessage
                    id="grunnlag.afp.avkortet.til.70.prosent"
                    values={{
                      ...getFormatMessageValues(),
                    }}
                  />
                )}
              {/* TODO: hvis pre2025OffentligAfp.afpAvkortetTil70Prosent eller
              prosent afp redusert, så rendre linken  */}
              {/* TODO: Flyttes inn i samme text som grunnlag.afp.avkortet.til.70.prosent hvis den er kun brukt her */}
              {pre2025OffentligAfp &&
                pre2025OffentligAfp.afpAvkortetTil70Prosent && (
                  <span>
                    &nbsp;
                    <Link
                      href="https://www.nav.no/afp-offentlig#beregning"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        logger(LINK_AAPNET, {
                          href: `/pensjon/kalkulator${paths.forbehold}`,
                          target: '_blank',
                        })
                      }}
                    >
                      <FormattedMessage id="grunnlag.afp.link.text" />
                    </Link>
                  </span>
                )}
            </ReadMore>
          )}
        </GrunnlagItem>

        <GrunnlagItem color="blue">
          <VStack gap="1">
            <Heading level="3" size="small">
              <FormattedMessage id="beregning.highcharts.serie.alderspensjon.name" />
            </Heading>

            <BodyLong className={styles.alderspensjonDetaljer}>
              {loependeVedtak.alderspensjon || visning === 'avansert' ? (
                <FormattedMessage
                  id="grunnlag.alderspensjon.endring.ingress"
                  values={{
                    ...getFormatMessageValues(),
                  }}
                />
              ) : (
                <FormattedMessage
                  id="grunnlag.alderspensjon.ingress"
                  values={{
                    ...getFormatMessageValues(),
                    avansert: (
                      <Link href="#" onClick={goToAvansert}>
                        avansert kalkulator
                      </Link>
                    ),
                  }}
                />
              )}
            </BodyLong>
          </VStack>

          <ReadMore
            name="Listekomponenter for alderspensjon"
            open={isAlderspensjonDetaljerVisible}
            header={
              isAlderspensjonDetaljerVisible
                ? intl.formatMessage(
                    {
                      id: 'beregning.detaljer.lukk',
                    },
                    {
                      ...getFormatMessageValues(),
                      ytelse: 'alderspensjon',
                    }
                  )
                : intl.formatMessage(
                    {
                      id: 'beregning.detaljer.vis',
                    },
                    {
                      ...getFormatMessageValues(),
                      ytelse: 'alderspensjon',
                    }
                  )
            }
            className={clsx(
              styles.visListekomponenter,
              styles.wideDetailedView
            )}
            onOpenChange={(open) =>
              handleReadMoreChange({ isOpen: open, ytelse: 'AP' })
            }
          >
            <AlderspensjonDetaljerGrunnlag
              alderspensjonDetaljerListe={alderspensjonDetaljerListe}
              hasPre2025OffentligAfpUttaksalder={Boolean(pre2025OffentligAfp)}
            />
            <FormattedMessage
              id="grunnlag.alderspensjon.ingress.link"
              values={{
                ...getFormatMessageValues(),
              }}
            />
          </ReadMore>
        </GrunnlagItem>
      </HStack>

      {/* TODO: Fjern style når Accordion fjernes */}
      <VStack marginBlock="12 0" style={{ marginBottom: '16px' }}>
        <Heading level={headingLevel} size="medium">
          <FormattedMessage id="om_deg.title" />
        </Heading>
      </VStack>

      <Accordion>
        <AccordionItem name="Gunnlag: Sivilstand">
          <GrunnlagSection
            headerTitle={intl.formatMessage({
              id: 'grunnlag.sivilstand.title',
            })}
            headerValue={formatertSivilstand}
          >
            <BodyLong>
              <FormattedMessage
                id="grunnlag.sivilstand.ingress"
                values={{
                  ...getFormatMessageValues(),
                }}
              />
            </BodyLong>
          </GrunnlagSection>
        </AccordionItem>

        <GrunnlagUtenlandsopphold
          harForLiteTrygdetid={harForLiteTrygdetid}
          trygdetid={trygdetid}
        />
      </Accordion>
    </section>
  )
}
