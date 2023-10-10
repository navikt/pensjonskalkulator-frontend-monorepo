import { redirect } from 'react-router'
import { RouteObject, Navigate, Outlet } from 'react-router-dom'

import { PageFramework } from '@/components/common/PageFramework'
import Henvisning1963 from '@/components/Henvisning1963'
import HenvisningUfoeretrygdGjenlevendepensjon from '@/components/HenvisningUfoeretrygdGjenlevendepensjon'
import { Beregning } from '@/pages/Beregning'
import { Forbehold } from '@/pages/Forbehold'
import { LandingPage } from '@/pages/LandingPage'
import { Personopplysninger } from '@/pages/Personopplysninger'
import { Step0 } from '@/pages/Step0'
import { Step1, Step1Feil } from '@/pages/Step1'
import { Step2 } from '@/pages/Step2'
import { Step3 } from '@/pages/Step3'
import { step3loader } from '@/pages/Step3/utils'
import { Step4 } from '@/pages/Step4'
import { Step5 } from '@/pages/Step5'
import { StepFeil } from '@/pages/StepFeil/'
import { RouteErrorBoundary } from '@/router/RouteErrorBoundary'
import { store } from '@/state/store'

export const BASE_PATH = '/pensjon/kalkulator'

export const externalUrls = {
  dinPensjon: 'https://nav.no/pensjon',
  dinPensjonBeholdning: 'https://www.nav.no/pensjon/opptjening/nb/',
  detaljertKalkulator:
    'https://pensjon-pselv-q2-gcp.intern.dev.nav.no/pselv/simulering.jsf',
  alderspensjonsregler: 'https://www.nav.no/alderspensjon#beregning',
  afp: 'https://www.afp.no',
  garantipensjon: 'https://www.nav.no/minstepensjon',
  norskPensjon: 'https://norskpensjon.no/',
  uinloggetKalkulator:
    'https://www.nav.no/pselv/simulering/forenkletsimulering.jsf',
  personvernerklaering:
    'https://www.nav.no/personvernerklaering#dine-rettigheter',
  personvernerklaeringKontaktOss:
    'https://www.nav.no/personvernerklaering#kontakt-nav',
}

export const paths = {
  root: '/',
  login: '/login',
  henvisningUfoeretrygdGjenlevendepensjon:
    '/henvisning-ufoeretrygd-gjenlevendepensjon',
  henvisning1963: '/henvisning-1963',
  start: '/start',
  samtykke: '/samtykke',
  utenlandsopphold: '/utenlandsopphold',
  utenlandsoppholdFeil: '/henvisning-utland',
  offentligTp: '/offentlig-tp',
  afp: '/afp',
  sivilstand: '/sivilstand',
  uventetFeil: '/uventet-feil',
  beregning: '/beregning',
  forbehold: '/forbehold',
  personopplysninger: '/personopplysninger',
} as const

const directAccessGuard = async () => {
  // Dersom ingen kall er registrert i store betyr det at brukeren prøver å aksessere en url direkte
  if (
    store.getState().api.queries === undefined ||
    Object.keys(store.getState().api.queries).length === 0
  ) {
    return redirect(paths.start)
  }
  return null
}

export const routes: RouteObject[] = [
  {
    element: (
      <PageFramework>
        <Outlet />
      </PageFramework>
    ),
    ErrorBoundary: RouteErrorBoundary,
    children: [
      {
        path: paths.root,
        element: <Navigate to={paths.start} replace />,
      },
      {
        path: paths.start,
        element: <Step0 />,
      },
      {
        path: paths.henvisningUfoeretrygdGjenlevendepensjon,
        element: <HenvisningUfoeretrygdGjenlevendepensjon />,
      },
      {
        path: paths.henvisning1963,
        element: <Henvisning1963 />,
      },
      {
        path: paths.utenlandsopphold,
        element: <Step1 />,
      },
      {
        path: paths.utenlandsoppholdFeil,
        element: <Step1Feil />,
      },
      {
        path: paths.samtykke,
        loader: directAccessGuard,
        element: <Step2 />,
      },
      {
        path: paths.offentligTp,
        loader: step3loader,
        element: <Step3 />,
      },
      {
        path: paths.afp,
        loader: directAccessGuard,
        element: <Step4 />,
      },
      {
        path: paths.sivilstand,
        loader: directAccessGuard,
        element: <Step5 />,
      },
      {
        path: paths.uventetFeil,
        loader: directAccessGuard,
        element: <StepFeil />,
      },
      {
        path: paths.forbehold,
        element: <Forbehold />,
      },
      {
        path: paths.personopplysninger,
        element: <Personopplysninger />,
      },
    ],
  },
  {
    path: paths.beregning,
    loader: directAccessGuard,
    element: (
      <PageFramework isFullWidth>
        <Beregning />
      </PageFramework>
    ),
    ErrorBoundary: RouteErrorBoundary,
  },
  {
    element: (
      <PageFramework shouldShowLogo hasWhiteBg isAuthenticated={false}>
        <Outlet />
      </PageFramework>
    ),
    children: [{ path: paths.login, element: <LandingPage /> }],
  },
]
