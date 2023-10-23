import { RouteObject, Navigate, Outlet } from 'react-router-dom'

import {
  PageFramework,
  FrameComponent,
} from '@/components/common/PageFramework'
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
import { Step4 } from '@/pages/Step4'
import { Step5 } from '@/pages/Step5'
import { StepFeil } from '@/pages/StepFeil/'
import { RouteErrorBoundary } from '@/router/RouteErrorBoundary'

import {
  directAccessGuard,
  authenticationGuard,
  tpoMedlemskapAccessGuard,
} from './loaders'

export const BASE_PATH = '/pensjon/kalkulator'

export const externalUrls = {
  dinPensjon: 'https://nav.no/pensjon',
  dinPensjonBeholdning: 'https://www.nav.no/pensjon/opptjening/nb/',
  detaljertKalkulator: 'https://www.nav.no/pselv/simulering.jsf',
  alderspensjonsregler: 'https://www.nav.no/alderspensjon#beregning',
  afp: 'https://www.afp.no',
  garantipensjon: 'https://www.nav.no/minstepensjon',
  norskPensjon: 'https://norskpensjon.no/',
  uinnloggetKalkulator:
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

export const routes: RouteObject[] = [
  {
    loader: authenticationGuard,
    path: paths.login,
    element: (
      <PageFramework
        shouldShowLogo
        hasWhiteBg
        shouldRedirectNonAuthenticated={false}
      >
        <LandingPage />
      </PageFramework>
    ),
  },
  {
    loader: authenticationGuard,
    element: (
      <PageFramework>
        <Outlet />
      </PageFramework>
    ),
    ErrorBoundary: RouteErrorBoundary,
    children: [
      {
        path: paths.root,
        element: <Navigate to={paths.login} replace />,
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
        loader: directAccessGuard,
        path: paths.samtykke,
        element: <Step2 />,
      },
      {
        loader: tpoMedlemskapAccessGuard,
        path: paths.offentligTp,
        element: <Step3 />,
      },
      {
        loader: directAccessGuard,
        path: paths.afp,
        element: <Step4 />,
      },
      {
        loader: directAccessGuard,
        path: paths.sivilstand,
        element: <Step5 />,
      },
      {
        loader: directAccessGuard,
        path: paths.uventetFeil,
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
    loader: directAccessGuard,
    path: paths.beregning,
    element: (
      <FrameComponent isFullWidth>
        <Beregning />
      </FrameComponent>
    ),
    ErrorBoundary: RouteErrorBoundary,
  },
]
