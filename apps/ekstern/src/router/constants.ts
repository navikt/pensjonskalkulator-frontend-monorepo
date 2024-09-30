export const BASE_PATH = '/pensjon/kalkulator'

export const externalUrls = {
  dinPensjon: 'https://nav.no/pensjon',
  dinPensjonBeholdning: 'https://www.nav.no/pensjon/opptjening/nb/',
  detaljertKalkulator: 'https://www.nav.no/pselv/simulering.jsf',
  alderspensjonsregler: 'https://www.nav.no/alderspensjon#beregning',
  afp: 'https://www.afp.no',
  afpPrivat: 'https://www.nav.no/afp-i-privat-sektor',
  garantipensjon: 'https://www.nav.no/minstepensjon',
  norskPensjon: 'https://norskpensjon.no/',
  uinnloggetKalkulator:
    'https://www.nav.no/pselv/simulering/forenkletsimulering.jsf',
  personvernerklaering:
    'https://www.nav.no/personvernerklaering#dine-rettigheter',
  personvernerklaeringKontaktOss:
    'https://www.nav.no/personvernerklaering#kontakt-nav',
  kontaktOss: 'https://www.nav.no/kontaktoss',
  planleggePensjon:
    'https://www.nav.no/planlegger-pensjon#noe-du-ikke-finner-svaret-p-her',
  trygdetid:
    'https://www.nav.no/no/person/flere-tema/arbeid-og-opphold-i-norge/relatert-informasjon/medlemskap-i-folketrygden',
  kortBotid: 'https://www.nav.no/alderspensjon#kort-botid',
}

export const paths = {
  root: '/',
  login: '/login',
  henvisning: '/henvisning',
  start: '/start',
  samtykke: '/samtykke',
  utenlandsopphold: '/utenlandsopphold',
  afp: '/afp',
  samtykkeOffentligAFP: '/samtykke-offentlig-afp',
  ufoeretrygdAFP: '/ufoeretrygd-afp',
  sivilstand: '/sivilstand',
  uventetFeil: '/uventet-feil',
  beregningEnkel: '/beregning',
  beregningAvansert: '/beregning-detaljert',
  forbehold: '/forbehold',
  personopplysninger: '/personopplysninger',
} as const

export const henvisningUrlParams = {
  foedselsdato: '1963',
  apotekerne: 'apotekerne',
  utland: 'utland',
} as const

export const stegvisningOrder = [
  paths.login,
  paths.start,
  paths.sivilstand,
  paths.utenlandsopphold,
  paths.afp,
  paths.ufoeretrygdAFP,
  paths.samtykkeOffentligAFP,
  paths.samtykke,
  paths.beregningEnkel,
] as const

export const stegvisningOrderEndring = [
  paths.login,
  paths.start,
  paths.afp,
  paths.beregningAvansert,
] as const
