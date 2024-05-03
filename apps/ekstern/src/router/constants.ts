export const BASE_PATH = '/pensjon/kalkulator'

export const externalUrls = {
  dinPensjon: 'https://nav.no/pensjon',
  dinPensjonBeholdning: 'https://www.nav.no/pensjon/opptjening/nb/',
  detaljertKalkulator: 'https://www.nav.no/pselv/simulering.jsf',
  alderspensjonsregler: 'https://www.nav.no/alderspensjon#beregning',
  afp: 'https://www.afp.no',
  garantipensjon: 'https://www.nav.no/minstepensjon',
  norskPensjon: 'https://norskpensjon.no/',
  uinnloggetKalkulator:
    'https://www.nav.no/pselv/simulering/forenkletsimulering.jsf',
  personvernerklaering:
    'https://www.nav.no/personvernerklaering#dine-rettigheter',
  personvernerklaeringKontaktOss:
    'https://www.nav.no/personvernerklaering#kontakt-nav',
  kontaktOss: 'https://www.nav.no/kontaktoss',
}

export const paths = {
  root: '/',
  login: '/login',
  henvisning: '/henvisning',
  start: '/start',
  samtykke: '/samtykke',
  utenlandsopphold: '/utenlandsopphold',
  offentligTp: '/offentlig-tp',
  afp: '/afp',
  ufoeretrygd: '/ufoeretrygd-afp',
  sivilstand: '/sivilstand',
  uventetFeil: '/uventet-feil',
  beregningEnkel: '/beregning',
  beregningDetaljert: '/beregning-detaljert',
  forbehold: '/forbehold',
  personopplysninger: '/personopplysninger',
} as const

export const henvisningUrlParams = {
  foedselsdato: '1963',
  ufoeretrygd: 'ufoeretrygd',
  gjenlevende: 'gjenlevende',
  apotekerne: 'apotekerne',
  utland: 'utland',
} as const
