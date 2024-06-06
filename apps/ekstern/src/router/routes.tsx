import { RouteObject, Navigate, Outlet } from 'react-router-dom'

import { PageFramework } from '@/components/common/PageFramework'
import { Beregning } from '@/pages/Beregning'
import { Forbehold } from '@/pages/Forbehold'
import { Henvisning } from '@/pages/Henvisning'
import { LandingPage } from '@/pages/LandingPage'
import { Personopplysninger } from '@/pages/Personopplysninger'
import { Step0 } from '@/pages/Step0'
import { Step1 } from '@/pages/Step1'
import { Step2 } from '@/pages/Step2'
import { Step3 } from '@/pages/Step3'
import { Step4 } from '@/pages/Step4'
import { Step5 } from '@/pages/Step5'
import { Step6 } from '@/pages/Step6'
import { Step7 } from '@/pages/Step7'
import { StepFeil } from '@/pages/StepFeil'
import { RouteErrorBoundary } from '@/router/RouteErrorBoundary'

import { paths } from './constants'
import {
  directAccessGuard,
  authenticationGuard,
  landingPageAccessGuard,
  step0AccessGuard,
  step3AccessGuard,
  step4AccessGuard,
  step5AccessGuard,
  step6AccessGuard,
  step7AccessGuard,
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
        loader: landingPageAccessGuard,
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
        loader: step0AccessGuard,
        path: paths.start,
        element: <Step0 />,
      },
      {
        path: `${paths.henvisning}/:id`,
        element: <Henvisning />,
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
        loader: directAccessGuard,
        path: paths.samtykke,
        element: <Step2 />,
      },
      {
        loader: step3AccessGuard,
        path: paths.offentligTp,
        element: <Step3 />,
      },
      {
        loader: step4AccessGuard,
        path: paths.afp,
        element: <Step4 />,
      },
      {
        loader: step5AccessGuard,
        path: paths.ufoeretrygd,
        element: <Step5 />,
      },
      {
        loader: step6AccessGuard,
        path: paths.samtykkeOffentligAFP,
        element: <Step6 />,
      },
      {
        loader: step7AccessGuard,
        path: paths.sivilstand,
        element: <Step7 />,
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
      <PageFramework isFullWidth hasWhiteBg>
        <Outlet />
      </PageFramework>
    ),
    ErrorBoundary: RouteErrorBoundary,
    children: [
      {
        loader: directAccessGuard,
        path: paths.beregningEnkel,
        element: <Beregning visning="enkel" />,
      },
      {
        loader: directAccessGuard,
        path: paths.beregningAvansert,
        element: <Beregning visning="avansert" />,
      },
    ],
  },
]
