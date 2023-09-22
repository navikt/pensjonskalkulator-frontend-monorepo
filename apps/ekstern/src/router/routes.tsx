import { redirect } from 'react-router'
import { RouteObject, Navigate, Outlet } from 'react-router-dom'

import { PageFramework } from '@/components/common/PageFramework'
import { Beregning } from '@/pages/Beregning'
import { Forbehold } from '@/pages/Forbehold'
import { LandingPage } from '@/pages/LandingPage'
import { Step1 } from '@/pages/Step1'
import { Step2 } from '@/pages/Step2'
import { Step3 } from '@/pages/Step3'
import { step3loader } from '@/pages/Step3/utils'
import { Step4 } from '@/pages/Step4'
import { Step5, Step5Feil } from '@/pages/Step5'
import { RouteErrorBoundary } from '@/router/RouteErrorBoundary'
import { store } from '@/state/store'

export const BASE_PATH = '/pensjon/kalkulator'

export const externalUrls = {
  dinPensjon: 'https://nav.no/pensjon',
  detaljertKalkulator: 'https://www.nav.no/pselv/simulering.jsf',
  alderspensjonsregler: 'https://www.nav.no/alderspensjon#beregning',
  afp: 'https://www.afp.no',
  garantipensjon: 'https://www.nav.no/minstepensjon',
  norskPensjkon: 'https://norskpensjon.no/',
}

export const paths = {
  root: '/',
  login: '/login',
  start: '/start',
  samtykke: '/samtykke',
  offentligTp: '/offentlig-tp',
  afp: '/afp',
  sivilstand: '/sivilstand',
  sivilstandFeil: '/sivilstand-feil',
  beregning: '/beregning',
  forbehold: '/forbehold',
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
        element: <Step1 />,
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
        path: paths.sivilstandFeil,
        loader: directAccessGuard,
        element: <Step5Feil />,
      },
      {
        path: paths.forbehold,
        loader: directAccessGuard,
        element: <Forbehold />,
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
      <PageFramework shouldShowLogo hasWhiteBg>
        <Outlet />
      </PageFramework>
    ),
    children: [{ path: paths.login, element: <LandingPage /> }],
  },
]
