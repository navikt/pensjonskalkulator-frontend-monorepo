import React from 'react'
import { FormattedMessage } from 'react-intl'

import { Box, Heading } from '@navikt/ds-react'

import { PensjonVisningDesktop, PensjonVisningMobil } from './Felles'
import { usePensjonBeregninger } from './hooks'

import styles from './MaanedligPensjon.module.scss'

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

export const MaanedligPensjon: React.FC<Props> = (props) => {
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
    <Box marginBlock="10 0" data-testid="maanedlig-pensjon">
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
