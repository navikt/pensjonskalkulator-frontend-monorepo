import { Stegvisning } from '@/components/Stegvisning'
import { Pensjonsberegning } from '@/containers/Pensjonsberegning'
import { ErrorPage404 } from '@/routes/ErrorPage404'
import { LandingPage } from '@/routes/LandingPage'
import { PageFramework } from '@/routes/PageFramework'

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
    path: '/stegvisning/:stepId',
    element: (
      <PageFramework>
        <Stegvisning />
      </PageFramework>
    ),
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
]
