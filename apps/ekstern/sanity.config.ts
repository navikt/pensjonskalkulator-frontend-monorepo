import { createClient, type ClientConfig } from '@sanity/client'
import { documentInternationalization } from '@sanity/document-internationalization'
import { RobotIcon, RocketIcon } from '@sanity/icons'
import { visionTool } from '@sanity/vision'
import { createAuthStore, defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { schemaTypes } from './schemaTypes'
import { supportedLanguages } from './schemaTypes/supportedLanguages'

export const projectId = 'g2by7q6m'

const config: ClientConfig = {
  projectId,
  // TODO bør være "development" når applikasjonen er i staging
  dataset: 'production',
  useCdn: true, // set to `false` to bypass the edge cache
  apiVersion: '2023-05-03', // use current date (YYYY-MM-DD) to target the latest API version
}

export const client = createClient(config)

const pluginsArray = [
  structureTool(),
  visionTool(),
  documentInternationalization({
    supportedLanguages,
    schemaTypes: ['readmore'],
    languageField: 'language',
  }),
]
export default defineConfig([
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
    auth: createAuthStore({
      projectId,
      dataset: 'production',
      mode: 'append',
      redirectOnSingle: true,
      providers: [
        {
          name: 'saml',
          title: 'NAV SSO',
          url: 'https://api.sanity.io/v2021-10-01/auth/saml/login/f3270b37',
        },
      ],
    }),
  },
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
    auth: createAuthStore({
      projectId,
      dataset: 'development',
      mode: 'append',
      redirectOnSingle: true,
      providers: [
        {
          name: 'saml',
          title: 'NAV SSO',
          url: 'https://api.sanity.io/v2021-10-01/auth/saml/login/f3270b37',
        },
      ],
    }),
  },
])
