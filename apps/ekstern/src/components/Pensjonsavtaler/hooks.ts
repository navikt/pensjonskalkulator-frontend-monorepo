import { useMemo } from 'react'

import { HeadingProps } from '@navikt/ds-react'

import { PrivatePensjonsavtalerProps } from './utils'

export interface OffentligTpAlert {
  status: string
  alertTextId?: string
  sanityId?: string
  variant: 'info' | 'warning'
  logTekst: string
  testId?: string
  hasLeverandoerList: boolean
}

export interface privatePensjonsavtalerAlert {
  alertTextId?: string
  sanityId?: string
  variant: 'info' | 'warning'
  logText?: string
  headingId?: string
  className?: string
}

export const useNextHeadingLevel = (
  level: HeadingProps['level'],
  fallback: HeadingProps['level'] = '4'
): HeadingProps['level'] => {
  return useMemo(() => {
    return level
      ? ((
          parseInt(level as string, 10) + 1
        ).toString() as HeadingProps['level'])
      : fallback
  }, [level, fallback])
}

export const usePrivatePensjonsAvtalerAlertList = (
  props: PrivatePensjonsavtalerProps
): privatePensjonsavtalerAlert[] => {
  const { isPartialResponse, isError, isSuccess, privatePensjonsavtaler } =
    props

  const errorOrNoPrivatePensjonsavtaler =
    isError || (isPartialResponse && privatePensjonsavtaler?.length === 0)

  const noPrivatePensjonsavtaler =
    isSuccess && !isPartialResponse && privatePensjonsavtaler?.length === 0

  const partialPrivatePensjonsavtaler =
    isSuccess &&
    isPartialResponse &&
    privatePensjonsavtaler &&
    privatePensjonsavtaler?.length > 0

  const alerts: privatePensjonsavtalerAlert[] = []

  if (noPrivatePensjonsavtaler) {
    alerts.push({
      sanityId: 'pensjonsavtaler.fant-ingen-private',
      variant: 'info',
      logText: 'Fant ingen private pensjonsavtaler',
      headingId: 'pensjonsavtaler.private.title.ingen',
    })
  }

  if (errorOrNoPrivatePensjonsavtaler) {
    alerts.push({
      sanityId: 'pensjonsavtaler.klarte-ikke-hente-private',
      variant: 'warning',
      logText: 'Klarte ikke å hente private pensjonsavtaler',
      headingId: 'pensjonsavtaler.private.title.ingen',
    })
  }

  if (partialPrivatePensjonsavtaler) {
    alerts.push({
      sanityId: 'pensjonsavtaler.klarte-ikke-hente-alle-private',
      variant: 'warning',
      logText: 'Klarte ikke å hente alle private pensjonsavtaler',
      className: 'alert__margin',
    })
  }

  return alerts
}

export const useOffentligTjenestePensjonAlertList = ({
  isError,
  offentligTp,
}: {
  isError: boolean
  offentligTp?: OffentligTpResponse
}): OffentligTpAlert[] => {
  const alerts: OffentligTpAlert[] = []
  const status = offentligTp?.simuleringsresultatStatus

  switch (status) {
    case 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING':
      alerts.push({
        status,
        sanityId: 'pensjonsavtaler.fant-ingen-offentlige',
        variant: 'info',
        testId: 'ingen-pensjonsavtaler-alert',
        hasLeverandoerList: false,
        logTekst: 'Fant ingen offentlige pensjonsavtaler',
      })
      break
    case 'TP_ORDNING_STOETTES_IKKE':
      alerts.push({
        status,
        sanityId: 'pensjonsavtaler.kan-ikke-hente-alle-offentlige',
        variant: 'warning',
        hasLeverandoerList: true,
        logTekst: 'Kan ikke hente offentlige pensjonsavtaler',
      })
      break
    case 'TEKNISK_FEIL':
      alerts.push({
        status,
        sanityId: 'pensjonsavtaler.klarte-ikke-hente-offentlig-tjenestepensjon',
        variant: 'warning',
        hasLeverandoerList: true,
        logTekst: 'Klarte ikke å hente offentlig tjenestepensjon',
      })
      break
    case 'TOM_SIMULERING_FRA_TP_ORDNING':
      alerts.push({
        status,
        sanityId: 'pensjonsavtaler.fikk-ikke-svar.offentlig',
        variant: 'warning',
        hasLeverandoerList: false,
        logTekst: 'Fikk ikke svar fra offentlig tjenestepensjonsordning',
      })
      break
  }

  if (isError) {
    alerts.push({
      status: 'ERROR',
      sanityId: 'pensjonsavtaler.klarte-ikke-sjekke-offentlige',
      variant: 'warning',
      hasLeverandoerList: false,
      logTekst: 'Klarte ikke å hente offentlige pensjonsavtaler',
    })
  }

  return alerts
}
