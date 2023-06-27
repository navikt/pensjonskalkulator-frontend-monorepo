import { RouteObject } from 'react-router-dom'

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
    loader: step3loader,
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
    path: '/sivilstand',
    element: (
      <PageFramework>
        <Step5 />
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
  },
]
