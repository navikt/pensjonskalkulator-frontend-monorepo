import { FormattedMessage } from 'react-intl'
import { Navigate, Outlet, RouteObject } from 'react-router'

import { Loader } from '@/components/common/Loader'
import { PageFramework } from '@/components/common/PageFramework'
import { Beregning } from '@/pages/Beregning'
import { ErrorSecurityLevel } from '@/pages/ErrorSecurityLevel'
import { Forbehold } from '@/pages/Forbehold'
import { Henvisning } from '@/pages/Henvisning'
import { IngenTilgang } from '@/pages/IngenTilgang'
import { LandingPage } from '@/pages/LandingPage'
import { StepAFP } from '@/pages/StepAFP'
import { StepFeil } from '@/pages/StepFeil'
import { StepKalkulatorVirkerIkke } from '@/pages/StepKalkulatorVirkerIkke'
import { StepSamtykkeOffentligAFP } from '@/pages/StepSamtykkeOffentligAFP'
import { StepSamtykkePensjonsavtaler } from '@/pages/StepSamtykkePensjonsavtaler'
import { StepSivilstand } from '@/pages/StepSivilstand'
import { StepStart } from '@/pages/StepStart'
import { StepUfoeretrygdAFP } from '@/pages/StepUfoeretrygdAFP'
import { StepUtenlandsopphold } from '@/pages/StepUtenlandsopphold'
import { RouteErrorBoundary } from '@/router/RouteErrorBoundary'

import { ErrorPage404 } from './RouteErrorBoundary/ErrorPage404'
import { paths } from './constants'
import {
  authenticationGuard,
  beregningEnkelAccessGuard,
  directAccessGuard,
  landingPageAccessGuard,
  stepAFPAccessGuard,
  stepSamtykkeOffentligAFPAccessGuard,
  stepSamtykkePensjonsavtaler,
  stepSivilstandAccessGuard,
  stepStartAccessGuard,
  stepUfoeretrygdAFPAccessGuard,
} from './loaders'

const fallback = (
  <Loader
    size="3xlarge"
    title={<FormattedMessage id="pageframework.loading" />}
  />
)

export const routes: RouteObject[] = [
  {
    loader: authenticationGuard,
    hydrateFallbackElement: fallback,
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
        loader: landingPageAccessGuard,
        element: <LandingPage />,
      },
    ],
  },
  {
    loader: authenticationGuard,
    hydrateFallbackElement: fallback,
    element: (
      <PageFramework>
        <Outlet />
      </PageFramework>
    ),
    ErrorBoundary: RouteErrorBoundary,
    children: [
      {
        loader: stepStartAccessGuard,
        path: paths.start,
        element: <StepStart />,
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
        loader: stepSivilstandAccessGuard,
        path: paths.sivilstand,
        element: <StepSivilstand />,
      },
      {
        loader: directAccessGuard,
        path: paths.utenlandsopphold,
        element: <StepUtenlandsopphold />,
      },
      {
        loader: stepAFPAccessGuard,
        path: paths.afp,
        element: <StepAFP />,
      },
      {
        loader: stepUfoeretrygdAFPAccessGuard,
        path: paths.ufoeretrygdAFP,
        element: <StepUfoeretrygdAFP />,
      },
      {
        loader: stepSamtykkeOffentligAFPAccessGuard,
        path: paths.samtykkeOffentligAFP,
        element: <StepSamtykkeOffentligAFP />,
      },
      {
        loader: stepSamtykkePensjonsavtaler,
        path: paths.samtykke,
        element: <StepSamtykkePensjonsavtaler />,
      },
      {
        loader: directAccessGuard,
        path: paths.uventetFeil,
        element: <StepFeil />,
      },
      {
        loader: directAccessGuard,
        path: paths.kalkulatorVirkerIkke,
        element: <StepKalkulatorVirkerIkke />,
      },
      {
        loader: directAccessGuard,
        path: paths.ingenTilgang,
        element: <IngenTilgang />,
      },
      {
        loader: directAccessGuard,
        path: paths.lavtSikkerhetsnivaa,
        element: <ErrorSecurityLevel />,
      },
    ],
  },
  {
    loader: authenticationGuard,
    // showLoader={false} trengs for at det skal virke å vise modal i avansert skjema når man trykker på tilbakeknappen i nettleseren
    element: (
      <PageFramework isFullWidth hasWhiteBg showLoader={false}>
        <Outlet />
      </PageFramework>
    ),
    ErrorBoundary: RouteErrorBoundary,
    children: [
      {
        loader: beregningEnkelAccessGuard,
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
  {
    path: '/*',
    element: <ErrorPage404 />,
  },
]
