import { Pensjonsberegning } from '@/containers/Pensjonsberegning'
import { ErrorPage404 } from '@/routes/ErrorPage404'
import { LandingPage } from '@/routes/LandingPage'
import { PageFramework } from '@/routes/PageFramework'
import { Step1 } from '@/routes/stegvisning/Step1'
import { Step2 } from '@/routes/stegvisning/Step2'
import { Step3 } from '@/routes/stegvisning/Step3'
import { Step4 } from '@/routes/stegvisning/Step4'

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
    path: '/start',
    element: (
      <PageFramework>
        <Step1 />
      </PageFramework>
    ),
  },
  {
    path: '/samtykke',
    element: (
      <PageFramework>
        <Step2 />
      </PageFramework>
    ),
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
