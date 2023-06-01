import { Pensjonsberegning } from '@/containers/Pensjonsberegning'
import { ErrorPage404 } from '@/routes/ErrorPage404'
import { LandingPage } from '@/routes/LandingPage'
import { PageFramework } from '@/routes/PageFramework'
import { Stegvisning } from '@/routes/Stegvisning'
import { Step } from '@/routes/Stegvisning/Step'

export const ROUTER_BASE_URL = '/pensjon/kalkulator'
export const routes = [
  {
    path: '/',
    element: (
      <PageFramework>
        <LandingPage />
      </PageFramework>
    ),
    errorElement: <ErrorPage404 />,
  },
  {
    path: '/stegvisning',
    element: (
      <PageFramework>
        <Stegvisning />
      </PageFramework>
    ),
    children: [
      {
        path: ':stepId',
        element: <Step />,
      },
    ],
  },
  {
    path: '/beregning',
    element: (
      <PageFramework>
        <Pensjonsberegning />
      </PageFramework>
    ),
    // action: rootAction,// TODO vudere å ta i bruk action og loader for henting av tidligst mulig uttak
    // loader: rootLoader,
  },
  {
    path: '/*',
    element: <ErrorPage404 />,
  },
]
