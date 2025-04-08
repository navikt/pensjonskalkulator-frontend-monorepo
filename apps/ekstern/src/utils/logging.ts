import {
  AmplitudeEvent,
  getAmplitudeInstance,
} from '@navikt/nav-dekoratoren-moduler'

import { isAnchorTag } from '@/state/api/typeguards'

type IExtendedAmpltitudeEvents =
  | AmplitudeEvent<'readmore åpnet', { tekst: string }>
  | AmplitudeEvent<'readmore lukket', { tekst: string }>
  | AmplitudeEvent<'accordion åpnet', { tekst: string }>
  | AmplitudeEvent<'accordion lukket', { tekst: string }>
  | AmplitudeEvent<'expansion card åpnet', { tekst: string }>
  | AmplitudeEvent<'expansion card lukket', { tekst: string }>
  | AmplitudeEvent<'modal åpnet', { tekst: string }>
  | AmplitudeEvent<'modal lukket', { tekst: string }>
  | AmplitudeEvent<'radiogroup valgt', { tekst: string; valg: string }>
  | AmplitudeEvent<'button klikk', { tekst: string }>
  | AmplitudeEvent<'chip valgt', { tekst: string; data: string }>
  | AmplitudeEvent<'chip avvalgt', { tekst: string; data: string }>
  | AmplitudeEvent<
      'grunnlag for beregningen',
      { tekst: string; data: string | number }
    >
  | AmplitudeEvent<
      'valg av uttaksalder for 100 % alderspensjon',
      { tekst: string; data: string }
    >
  | AmplitudeEvent<
      'valg av uttaksalder for gradert alderspensjon',
      { tekst: string; data: string }
    >
  | AmplitudeEvent<'valg av uttaksgrad', { tekst: string; data: string }>
  | AmplitudeEvent<
      'valg av inntekt vsa. gradert pensjon (antall sifre)',
      { tekst: string; data: string }
    >
  | AmplitudeEvent<
      'valg av inntekt vsa. 100 % pensjon (antall sifre)',
      { tekst: string }
    >
  | AmplitudeEvent<'graf tooltip åpnet', { data: string }>
  | AmplitudeEvent<'table expand åpnet', { tekst: string; data: string }>
  | AmplitudeEvent<'table expand lukket', { tekst: string; data: string }>
  | AmplitudeEvent<'help text åpnet', { tekst: string }>
  | AmplitudeEvent<'help text lukket', { tekst: string }>
  | AmplitudeEvent<'alert vist', { tekst: string; variant: string }>
  | AmplitudeEvent<
      'skjema validering feilet',
      { skjemanavn: string; data: string; tekst: string }
    >
  | AmplitudeEvent<'feilside', { tekst: string }>
  | AmplitudeEvent<'link åpnet', { href?: string; target?: string }>
  | AmplitudeEvent<'info', { tekst: string; data: string | number }>
  | AmplitudeEvent<'show more åpnet', { tekst: string }>
  | AmplitudeEvent<'show more lukket', { tekst: string }>
  | AmplitudeEvent<'resultat vist', { tekst: string }>

export const logger =
  getAmplitudeInstance<IExtendedAmpltitudeEvents>('dekoratoren')

export const wrapLogger =
  (
    name: IExtendedAmpltitudeEvents['name'],
    properties: IExtendedAmpltitudeEvents['properties']
  ) =>
  (func: () => void) =>
  () => {
    logger(name, properties)
    return func()
  }

export const logOpenLink: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
  if (isAnchorTag(e.target)) {
    e.preventDefault()
    const { href, target } = e.target
    logger('link åpnet', { href, target })
    window.open(href, target)
  }
}
