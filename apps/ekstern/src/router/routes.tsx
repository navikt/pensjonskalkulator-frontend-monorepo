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
import { Step4 } from '@/pages/Step4'
import { Step5 } from '@/pages/Step5'
import { StepFeil } from '@/pages/StepFeil/'
import { RouteErrorBoundary } from '@/router/RouteErrorBoundary'

import { paths } from './constants'
import {
  directAccessGuard,
  authenticationGuard,
  tpoMedlemskapAccessGuard,
} from './loaders'

export const routes: RouteObject[] = [
  {
    loader: authenticationGuard,
    element: (
      <PageFramework
        shouldShowLogo
        hasWhiteBg
        shouldRedirectNonAuthenticated={false}
      >
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
        path: paths.login,
        element: <LandingPage />,
      },
      {
        path: paths.personopplysninger,
        element: <Personopplysninger />,
      },
    ],
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
        path: paths.forbehold,
        element: <Forbehold />,
      },
      {
        loader: directAccessGuard,
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
    ],
  },
  {
    loader: authenticationGuard,
    element: (
      <PageFramework isFullWidth>
        <Outlet />
      </PageFramework>
    ),
    ErrorBoundary: RouteErrorBoundary,
    children: [
      {
        loader: directAccessGuard,
        path: paths.beregning,
        element: <Beregning />,
      },
    ],
  },
]
