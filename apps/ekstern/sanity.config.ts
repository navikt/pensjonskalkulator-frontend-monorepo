import { createAuthStore, defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'pensjonskalkulator-frontend',

  projectId: 'g2by7q6m',
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
  auth: createAuthStore({
    projectId: 'g2by7q6m',
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
})
