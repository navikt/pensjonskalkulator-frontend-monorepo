import React from 'react'
import { FormattedMessage } from 'react-intl'

import { Box, Heading } from '@navikt/ds-react'

import { PensjonVisningDesktop, PensjonVisningMobil } from './Felles'
import { usePensjonBeregninger } from './hooks'

import styles from './MaanedsbeloepAvansertBeregning.module.scss'

interface Props {
  afpPrivatListe?: AfpPrivatPensjonsberegning[] | null
  afpOffentligListe?: AfpPensjonsberegning[] | null
  alderspensjonMaanedligVedEndring?: AlderspensjonMaanedligVedEndring | null
  pre2025OffentligAfp?: AfpEtterfulgtAvAlderspensjon | null
  offentligAfpFraTpOrdning?: UtbetalingsperiodeFoer1963[] | null
  pensjonsavtaler?: Pensjonsavtale[] | null
  simulertTjenestepensjon?: SimulertTjenestepensjon | null
  skalViseNullOffentligTjenestepensjon?: boolean
  erTpFoer1963?: boolean
}

export const MaanedsbeloepAvansertBeregning: React.FC<Props> = (props) => {
  const {
    pensjonsdata,
    summerYtelser,
    hentUttaksmaanedOgAar,
    harGradering,
    uttaksalder,
  } = usePensjonBeregninger(props)

  if (!uttaksalder) {
    return null
  }

  return (
    <Box
      marginBlock="space-40 space-0"
      data-testid="maanedsbloep-avansert-beregning"
      onCopy={(event) => {
        // Behold etikett og beløp på samme linje, med linjeskift mellom rader og overskrifter ved innliming.
        // Skjult innhold (f.eks. desktop-visningen på mobil) tas ikke med.
        const selection = window.getSelection()
        if (!selection || selection.isCollapsed) return

        event.currentTarget
          .querySelectorAll('*')
          .forEach((element) =>
            element.toggleAttribute(
              'data-copy-hidden',
              getComputedStyle(element).display === 'none'
            )
          )
        const content = selection.getRangeAt(0).cloneContents()
        content
          .querySelectorAll('[data-copy-hidden]')
          .forEach((element) => element.remove())
        content.querySelectorAll('th, td').forEach((cell) => cell.append(' '))
        content.querySelectorAll('tr, h3, h4, button').forEach((line) => {
          const text = line.textContent ?? ''
          const singleLineText = text.replace(/[ \t\r\n]+/g, ' ').trim()
          line.replaceWith(`${singleLineText}\n`)
        })
        event.clipboardData.setData(
          'text/plain',
          (content.textContent ?? '').trim()
        )
        event.preventDefault()
      }}
    >
      <Heading size="small" level="3">
        <FormattedMessage id="maanedsbeloep.title" />
      </Heading>

      <div className={styles.maanedsbeloepDesktopOnly}>
        <PensjonVisningDesktop
          pensjonsdata={pensjonsdata}
          summerYtelser={summerYtelser}
          hentUttaksmaanedOgAar={hentUttaksmaanedOgAar}
          harGradering={harGradering}
          erTpFoer1963={props.erTpFoer1963}
          skalViseNullOffentligTjenestepensjon={
            props.skalViseNullOffentligTjenestepensjon
          }
        />
      </div>

      <div className={styles.maanedsbeloepMobileOnly}>
        <PensjonVisningMobil
          pensjonsdata={pensjonsdata}
          summerYtelser={summerYtelser}
          hentUttaksmaanedOgAar={hentUttaksmaanedOgAar}
          harGradering={harGradering}
          skalViseNullOffentligTjenestepensjon={
            props.skalViseNullOffentligTjenestepensjon
          }
        />
      </div>
    </Box>
  )
}
