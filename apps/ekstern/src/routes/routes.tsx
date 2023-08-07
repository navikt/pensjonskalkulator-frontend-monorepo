import { redirect } from 'react-router'
import { RouteObject, Navigate, Outlet } from 'react-router-dom'

import { PageFramework } from '@/components/components/PageFramework'
import { Pensjonsberegning } from '@/containers/Pensjonsberegning'
import { LandingPage } from '@/routes/LandingPage'
import { RouteErrorBoundary } from '@/routes/RouteErrorBoundary'
import { Step1 } from '@/routes/stegvisning/Step1'
import { Step2 } from '@/routes/stegvisning/Step2'
import { Step3 } from '@/routes/stegvisning/Step3'
import { step3loader } from '@/routes/stegvisning/Step3/utils'
import { Step4 } from '@/routes/stegvisning/Step4'
import { Step5 } from '@/routes/stegvisning/Step5'
import { store } from '@/state/store'

export const BASE_PATH = '/pensjon/kalkulator'

export const externalsUrls = {
  dinPensjon: 'http://www.nav.no/pensjon',
}

export const paths = {
  root: '/',
  login: '/login',
  start: '/start',
  samtykke: '/samtykke',
  offentligTp: '/offentlig-tp',
  afp: '/afp',
  sivilstand: '/sivilstand',
  beregning: '/beregning',
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
        path: paths.login,
        element: <LandingPage />,
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
    ],
  },
  {
    path: paths.beregning,
    loader: directAccessGuard,
    element: (
      <PageFramework isFullWidth>
        <Pensjonsberegning />
      </PageFramework>
    ),
    ErrorBoundary: RouteErrorBoundary,
  },
]
