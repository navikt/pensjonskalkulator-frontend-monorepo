import { redirect } from 'react-router'
import { RouteObject, Navigate } from 'react-router-dom'

import { Pensjonsberegning } from '@/containers/Pensjonsberegning'
import { LandingPage } from '@/routes/LandingPage'
import { PageFramework } from '@/routes/PageFramework'
import { RouteErrorBoundary } from '@/routes/RouteErrorBoundary'
import { Step1 } from '@/routes/stegvisning/Step1'
import { Step2 } from '@/routes/stegvisning/Step2'
import { Step3 } from '@/routes/stegvisning/Step3'
import { step3loader } from '@/routes/stegvisning/Step3/utils'
import { Step4 } from '@/routes/stegvisning/Step4'
import { Step5 } from '@/routes/stegvisning/Step5'
import { store } from '@/state/store'

export const ROUTER_BASE_URL = '/pensjon/kalkulator'

export const samtykkeGuard = async () => {
  if (store.getState().userInput.samtykke === null) {
    return redirect('/start')
  }
  return null
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/start" replace />,
    ErrorBoundary: RouteErrorBoundary,
  },
  {
    path: '/login',
    element: (
      <PageFramework>
        <LandingPage />
      </PageFramework>
    ),
    ErrorBoundary: RouteErrorBoundary,
  },
  {
    path: '/start',
    element: (
      <PageFramework>
        <Step1 />
      </PageFramework>
    ),
    ErrorBoundary: RouteErrorBoundary,
  },
  {
    path: '/samtykke',
    element: (
      <PageFramework>
        <Step2 />
      </PageFramework>
    ),
    ErrorBoundary: RouteErrorBoundary,
  },
  {
    path: '/offentlig-tp',
    loader: step3loader,
    element: (
      <PageFramework>
        <Step3 />
      </PageFramework>
    ),
  },
  {
    path: '/afp',
    loader: samtykkeGuard,
    element: (
      <PageFramework>
        <Step4 />
      </PageFramework>
    ),
    ErrorBoundary: RouteErrorBoundary,
  },
  {
    path: '/sivilstand',
    loader: samtykkeGuard,
    element: (
      <PageFramework>
        <Step5 />
      </PageFramework>
    ),
    ErrorBoundary: RouteErrorBoundary,
  },
  {
    path: '/beregning',
    loader: samtykkeGuard,
    element: (
      <PageFramework>
        <Pensjonsberegning />
      </PageFramework>
    ),
    ErrorBoundary: RouteErrorBoundary,
  },
]
