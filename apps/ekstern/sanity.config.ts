import { colorInput } from '@sanity/color-input'
import { documentInternationalization } from '@sanity/document-internationalization'
import { RobotIcon, RocketIcon } from '@sanity/icons'
import { visionTool } from '@sanity/vision'
import { createAuthStore, defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import auditTimelinePlugin from './sanity/components/audit-timeline'
import { deskStructure } from './sanity/deskStructure'
import { schemaTypes } from './sanity/schemaTypes'
import { supportedLanguages } from './sanity/supportedLanguages'

export const projectId = 'g2by7q6m'

interface AuthProvider {
  name: string
  title: string
  url: string
}

interface AuthStoreOptions {
  projectId: string
  dataset: string
  mode?: 'append' | 'replace'
  redirectOnSingle?: boolean
  providers: AuthProvider[]
}

type AuthStore = ReturnType<typeof createAuthStore>

const createTypedAuthStore = (options: AuthStoreOptions): AuthStore =>
  (createAuthStore as (opts: AuthStoreOptions) => AuthStore)(options)

const samlProviders: AuthProvider[] = [
  {
    name: 'saml',
    title: 'NAV SSO',
    url: 'https://api.sanity.io/v2021-10-01/auth/saml/login/f3270b37',
  },
]

const pluginsArray = [
  structureTool({
    structure: deskStructure,
  }),
  visionTool(),
  colorInput(),
  documentInternationalization({
    supportedLanguages,
    schemaTypes: ['readmore', 'forbeholdAvsnitt', 'guidepanel'],
    languageField: 'language',
  }),
  auditTimelinePlugin(),
]

export default defineConfig([
  {
    projectId,
    dataset: 'development',
    name: 'pensjonskalkulator-frontend-development-workspace',
    basePath: '/development',
    title: 'Development Workspace',
    subtitle: 'development',
    icon: RobotIcon,
    plugins: [...pluginsArray],
    schema: {
      types: schemaTypes,
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    auth: createTypedAuthStore({
      projectId,
      dataset: 'development',
      mode: 'append',
      redirectOnSingle: true,
      providers: samlProviders,
    }),
  },
  {
    projectId,
    dataset: 'production',
    name: 'pensjonskalkulator-frontend-production-workspace',
    basePath: '/production',
    title: 'Production Workspace',
    subtitle: 'production',
    icon: RocketIcon,
    plugins: [...pluginsArray],
    schema: {
      types: schemaTypes,
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    auth: createTypedAuthStore({
      projectId,
      dataset: 'production',
      mode: 'append',
      redirectOnSingle: true,
      providers: samlProviders,
    }),
  },
])
