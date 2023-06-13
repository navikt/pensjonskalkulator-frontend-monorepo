import { RouteObject } from 'react-router-dom'

import { RouteErrorBoundary } from '@/components/RouteErrorBoundary'
import { Pensjonsberegning } from '@/containers/Pensjonsberegning'
import { LandingPage } from '@/routes/LandingPage'
import { PageFramework } from '@/routes/PageFramework'
import { Step1 } from '@/routes/stegvisning/Step1'
import { Step2 } from '@/routes/stegvisning/Step2'
import { Step3 } from '@/routes/stegvisning/Step3'
import { Step4 } from '@/routes/stegvisning/Step4'

export const ROUTER_BASE_URL = '/pensjon/kalkulator'

export const routes: RouteObject[] = [
  {
    path: '/',
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
    element: (
      <PageFramework>
        <Step3 />
      </PageFramework>
    ),
  },

  {
    path: '/afp',
    element: (
      <PageFramework>
        <Step4 />
      </PageFramework>
    ),
    ErrorBoundary: RouteErrorBoundary,
  },
  {
    path: '/beregning',
    element: (
      <PageFramework>
        <Pensjonsberegning />
      </PageFramework>
    ),
    ErrorBoundary: RouteErrorBoundary,
    // action: rootAction,// TODO vudere å ta i bruk action og loader for henting av tidligst mulig uttak
    // loader: rootLoader,
  },
]
